import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'
import UserTransformer from '#transformers/user_transformer'
import hash from '@adonisjs/core/services/hash'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'

const REFRESH_TOKEN_EXPIRES_DAYS = 30

async function findAndVerify(identifier: string, password: string) {
  const isPhone = /^\+?[\d\s\-()]{7,20}$/.test(identifier) && !identifier.includes('@')

  // Step 1: check email or phone exists
  const user = await User.query()
    .where(isPhone ? 'phone_number' : 'email', identifier)
    .first()

  if (!user) {
    throw Object.assign(new Error('Email or phone number not found'), { code: 'USER_NOT_FOUND' })
  }

  if (String(user.status) === '0') {
    throw Object.assign(new Error('Your account is inactive. Please contact admin.'), {
      code: 'ACCOUNT_INACTIVE',
    })
  }

  // Step 2: check password
  const passwordValid = await hash.verify(user.password, password)
  if (!passwordValid) {
    throw Object.assign(new Error('Incorrect password'), { code: 'WRONG_PASSWORD' })
  }

  return user
}

async function issueTokens(user: User, fcmToken: string | null) {
  const refreshToken = randomBytes(40).toString('hex')
  const expiresAt = DateTime.now()
    .setZone('Asia/Phnom_Penh')
    .plus({ days: REFRESH_TOKEN_EXPIRES_DAYS })

  user.refreshToken = refreshToken
  user.expiresIn = expiresAt.toISO()
  if (fcmToken) {
    // Remove this token from any other account so only one user owns it
    await User.query()
      .where('fcm_token', String(fcmToken))
      .whereNot('id', user.id)
      .update({ fcm_token: null })
    user.fcmToken = String(fcmToken)
  }
  await user.save()

  const accessToken = await User.accessTokens.create(user, ['*'], {
    expiresIn: `${REFRESH_TOKEN_EXPIRES_DAYS} days`,
  })

  return {
    user: UserTransformer.transform(user),
    token: accessToken.value!.release(),
    refresh_token: refreshToken,
    expires_in: expiresAt.toISO(),
  }
}

export default class AccessTokenController {
  async store({ request, response, serialize }: HttpContext) {
    const { identifier, password } = await request.validateUsing(loginValidator)

    try {
      const user = await findAndVerify(identifier, password)
      const fcmToken = request.input('fcm_token', null)
      return serialize(await issueTokens(user, fcmToken))
    } catch (err: any) {
      if (err.code === 'ACCOUNT_INACTIVE') {
        return response.forbidden({ message: err.message })
      }
      return response.unauthorized({ message: err.message ?? 'Invalid credentials' })
    }
  }

  async adminLogin({ request, response, serialize }: HttpContext) {
    const { identifier, password } = await request.validateUsing(loginValidator)

    try {
      const user = await findAndVerify(identifier, password)

      if (user.role !== 'admin') {
        return response.forbidden({ message: 'Access denied. Admins only.' })
      }

      const fcmToken = request.input('fcm_token', null)
      console.log('==========================')
      console.log(`[ADMIN LOGIN] user: ${user.email} | fcm_token: ${fcmToken ?? 'NULL'}`)
      console.log('==========================')
      return serialize(await issueTokens(user, fcmToken))
    } catch (err: any) {
      if (err.code === 'ACCOUNT_INACTIVE') {
        return response.forbidden({ message: err.message })
      }
      return response.unauthorized({ message: err.message ?? 'Invalid credentials' })
    }
  }

  async destroy({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.currentAccessToken) {
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    }
    // Clear FCM token so this device stops receiving notifications after logout
    user.fcmToken = null
    await user.save()
    return { message: 'Logged out successfully' }
  }
}
