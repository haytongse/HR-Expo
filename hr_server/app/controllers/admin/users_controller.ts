import User from '#models/user'
import UserShiftSchedule from '#models/user_shift_schedule'
import { createUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

const serializeUser = (u: User, shiftSchedule?: any) => ({
  id: u.id,
  userCode: u.userCode,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  status: u.status,
  allowWifi: !!u.allowWifi,
  noCheckOut: !!u.noCheckOut,
  allowOutside: !!u.allowOutside,
  phoneNumber: u.phoneNumber,
  address: u.address,
  birthOfDate: u.birthOfDate,
  profilePicture: u.profilePicture,
  campusId: u.campusId,
  initials: u.initials,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  shiftSchedule: shiftSchedule ?? null,
})

export default class AdminUsersController {
  async index({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = User.query()
    if (campusId !== null) query.where('campus_id', campusId)
    const users = await query
    const assignments = await UserShiftSchedule.query().preload('shiftSchedule' as never)
    const data = users.map((u) => {
      const assignment = assignments.find((a) => a.userId === u.id)
      return serializeUser(u, (assignment as any)?.shiftSchedule)
    })
    return response.ok({ data })
  }

  async store({ request, response }: HttpContext) {
    const data = await request.validateUsing(createUserValidator)
    const user = await User.create({
      ...data,
      campusId: data.campusId != null ? String(data.campusId) : null,
    } as any)
    return response.created({ data: serializeUser(user) })
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const data = request.only([
      'userCode',
      'fullName',
      'email',
      'role',
      'phoneNumber',
      'address',
      'birthOfDate',
      'status',
      'campusId',
      'password',
      'noCheckOut',
      'allowWifi',
      'allowOutside',
    ])
    const { password, ...rest } = data
    user.merge(rest)
    if (password) user.password = String(password)
    await user.save()
    return response.ok({ data: serializeUser(user) })
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.noContent()
  }

  async importUsers({ request, response }: HttpContext) {
    const rows: any[] = request.input('users', [])
    if (!Array.isArray(rows) || rows.length === 0) {
      return response.badRequest({ message: 'No users provided' })
    }

    const created: any[] = []
    const errors: { row: number; message: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        // ── Upsert: update if id provided, else create ──────────────────────
        if (row.id) {
          const user = await User.find(Number(row.id))
          if (!user) {
            errors.push({ row: i + 1, message: `User with id ${row.id} not found` })
            continue
          }
          user.merge({
            userCode: row.userCode || user.userCode,
            fullName: row.fullName || user.fullName,
            email: row.email || user.email,
            phoneNumber: row.phoneNumber || user.phoneNumber,
            address: row.address || user.address,
            birthOfDate: row.birthOfDate || user.birthOfDate,
            campusId: row.campusId ? String(row.campusId) : user.campusId,
            role: row.role === 'admin' ? 'admin' : row.role === 'user' ? 'user' : user.role,
          })
          if (row.password) {
            user.password = row.password
          }
          await user.save()
          created.push(serializeUser(user))
          continue
        }

        if (!row.email || !row.password) {
          errors.push({ row: i + 1, message: 'Email and password are required' })
          continue
        }
        const existing = await User.findBy('email', row.email)
        if (existing) {
          errors.push({ row: i + 1, message: `Email "${row.email}" already exists` })
          continue
        }
        const user = await User.create({
          userCode: row.userCode || null,
          fullName: row.fullName || null,
          email: row.email,
          password: row.password,
          phoneNumber: row.phoneNumber || null,
          address: row.address || null,
          birthOfDate: row.birthOfDate || null,
          campusId: row.campusId ? String(row.campusId) : null,
          role: row.role === 'admin' ? 'admin' : 'user',
        })
        created.push(serializeUser(user))
      } catch (e: any) {
        errors.push({ row: i + 1, message: e?.message ?? 'Unknown error' })
      }
    }

    return response.ok({ created: created.length, errors })
  }
}
