import DailyWork from '#models/daily_work'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { sendPushNotification } from '#services/notification_service'

export default class AdminDailyWorksController {
  async index({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = DailyWork.query().preload('user').preload('campus').preload('approver').preload('photos').orderBy('created_at', 'desc')
    if (campusId !== null) query.where('campus_id', campusId)
    const records = await query
    return response.ok(records)
  }

  async monthly({ auth, request, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const qs    = request.qs()
    const year  = Number(Array.isArray(qs.year)  ? qs.year[0]  : qs.year)
    const month = Number(Array.isArray(qs.month) ? qs.month[0] : qs.month)

    if (!year || !month) {
      return response.badRequest({ message: 'year and month are required' })
    }

    const query = DailyWork.query()
      .preload('user').preload('campus').preload('approver')
      .where('year', year).where('month', month)
      .orderBy('user_id', 'asc').orderBy('day', 'asc')
    if (campusId !== null) query.where('campus_id', campusId)
    const records = await query
    return response.ok(records)
  }

  async approve({ auth, params, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const record = await DailyWork.findOrFail(params.id)
    record.status = 'approved'
    record.approvedBy = admin.id
    await record.save()

    const owner = await User.find(record.userId)
    if (owner?.fcmToken) {
      const dateStr = `${String(record.day).padStart(2, '0')}/${String(record.month).padStart(2, '0')}/${record.year}`
      await sendPushNotification(owner.fcmToken, '✅ Daily Work Approved', `Your daily work for ${dateStr} has been approved.`, { type: 'daily_work_user' })
    }

    return response.ok(record)
  }

  async reject({ auth, params, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const record = await DailyWork.findOrFail(params.id)
    record.status = 'rejected'
    record.approvedBy = admin.id
    await record.save()

    const owner = await User.find(record.userId)
    if (owner?.fcmToken) {
      const dateStr = `${String(record.day).padStart(2, '0')}/${String(record.month).padStart(2, '0')}/${record.year}`
      await sendPushNotification(owner.fcmToken, '❌ Daily Work Rejected', `Your daily work for ${dateStr} has been rejected.`, { type: 'daily_work_user' })
    }

    return response.ok(record)
  }
}
