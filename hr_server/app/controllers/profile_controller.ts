import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import UserShiftSchedule from '#models/user_shift_schedule'
import TimeTable from '#models/time_table'
import ShiftSchedule from '#models/shift_schedule'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { join } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'

export default class ProfileController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserTransformer.transform(auth.getUserOrFail()))
  }

  async myShift({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const now = DateTime.now().setZone('Asia/Phnom_Penh')
    const dow = now.weekday % 7 // 0=Sun,1=Mon,...,6=Sat

    const userShift = await UserShiftSchedule.query()
      .where('user_id', Number(user.id))
      .orderBy('created_at', 'desc')
      .first()

    if (!userShift?.shiftScheduleId) {
      return response.ok({ shift: null, timetable: null })
    }

    const shift = await ShiftSchedule.find(userShift.shiftScheduleId)
    const timetables = await TimeTable.query()
      .where('shift_schedule_id', userShift.shiftScheduleId)
      .where('day_of_week', dow)
      .orderBy('start_time', 'asc')

    return response.ok({
      shift: shift
        ? {
            id: shift.id,
            name: shift.name,
            startDate: shift.startDate,
            endDate: shift.endDate,
            allowTimeBefore: shift.allowTimeBefore,
            allowTimeAfter: shift.allowTimeAfter,
            allowAmountScan: shift.allowAmountScan,
          }
        : null,
      timetables: timetables.map((t) => ({
        id: t.id,
        label: t.label,
        startTime: t.startTime,
        endTime: t.endTime,
        dayOfWeek: t.dayOfWeek,
      })),
    })
  }

  async update({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const body = request.only(['full_name', 'phone_number', 'address', 'birth_of_date'])
    if (body.full_name     !== undefined) user.fullName    = body.full_name     ? String(body.full_name)     : null
    if (body.phone_number  !== undefined) user.phoneNumber = body.phone_number  ? String(body.phone_number)  : null
    if (body.address       !== undefined) user.address     = body.address       ? String(body.address)       : null
    if (body.birth_of_date !== undefined) (user as any).birthOfDate = body.birth_of_date ? String(body.birth_of_date) : null
    await user.save()
    return response.ok({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      birthOfDate: (user as any).birthOfDate,
      profilePicture: (user as any).profilePicture,
    })
  }

  async updateProfilePicture({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const base64 = request.input('photo_base64')
    if (!base64) return response.badRequest({ message: 'photo_base64 is required' })
    const dir = join(process.cwd(), 'public', 'profiles')
    await mkdir(dir, { recursive: true })
    const filename = `${user.id}_${Date.now()}.jpg`
    const buffer = Buffer.from(String(base64).replace(/^data:image\/\w+;base64,/, ''), 'base64')
    await writeFile(join(dir, filename), buffer)
    ;(user as any).profilePicture = `/profiles/${filename}`
    await user.save()
    return response.ok({ profilePicture: (user as any).profilePicture })
  }

  async updateFcmToken({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const fcmToken = request.input('fcm_token')
    if (!fcmToken) return response.badRequest({ message: 'fcm_token is required' })
    // Remove this token from any other account so only one user owns it
    await User.query()
      .where('fcm_token', String(fcmToken))
      .whereNot('id', user.id)
      .update({ fcm_token: null })
    user.fcmToken = String(fcmToken)
    await user.save()
    return response.ok({ message: 'FCM token updated' })
  }
}
