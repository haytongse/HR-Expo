import CheckIn from '#models/check_in'
import User from '#models/user'
import UserShiftSchedule from '#models/user_shift_schedule'
import ShiftSchedule from '#models/shift_schedule'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AdminCheckInsController {
  async index({ auth, request, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const qs = request.qs()
    const user_id = Array.isArray(qs.user_id) ? qs.user_id[0] : qs.user_id
    const date = Array.isArray(qs.date) ? qs.date[0] : qs.date
    const page = Number(Array.isArray(qs.page) ? qs.page[0] : (qs.page ?? 1)) || 1

    const query = CheckIn.query()
      .preload('user')
      .orderBy('created_at', 'desc')

    if (campusId !== null) {
      query.whereHas('user', (q) => q.where('campus_id', campusId))
    }

    if (user_id) query.where('user_id', Number(user_id))

    if (date) {
      const d = DateTime.fromISO(String(date))
      if (d.isValid) {
        query.where('year', d.year).where('month', d.month).where('day', d.day)
      }
    }

    // When filtering by a specific date return all records (no pagination needed)
    if (date) {
      const checkIns = await query.exec()
      return response.ok(checkIns)
    }

    const checkIns = await query.paginate(page, 50)
    return response.ok(checkIns)
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

    const recordsQuery = CheckIn.query()
      .preload('user')
      .where('year', year)
      .where('month', month)
      .orderBy('user_id', 'asc')
      .orderBy('day', 'asc')
      .orderBy('created_at', 'asc')

    if (campusId !== null) {
      recordsQuery.whereHas('user', (q) => q.where('campus_id', campusId))
    }

    const records = await recordsQuery

    // Build allowAmountScan map per user from their latest shift schedule
    const userIds = [...new Set(records.map(r => r.userId).filter(Boolean))] as number[]
    const shiftRows = await UserShiftSchedule.query()
      .whereIn('user_id', userIds)
      .orderBy('created_at', 'desc')

    // Keep only the latest shift per user
    const latestShift = new Map<number, number>()
    for (const s of shiftRows) {
      if (s.userId && !latestShift.has(s.userId)) {
        latestShift.set(s.userId, Number(s.shiftScheduleId))
      }
    }

    const shiftIds = [...new Set(latestShift.values())]
    const shiftDefs = shiftIds.length
      ? await ShiftSchedule.query().whereIn('id', shiftIds).select(['id', 'allow_amount_scan'])
      : []
    const shiftAllowMap = new Map(shiftDefs.map(s => [s.id, s.allowAmountScan ? Number(s.allowAmountScan) : null]))

    // allowAmountScan per userId
    const userAllowScan: Record<number, number | null> = {}
    for (const [uid, shiftId] of latestShift) {
      userAllowScan[uid] = shiftAllowMap.get(shiftId) ?? null
    }

    return response.ok({ data: records, userAllowScan })
  }

  async userIds({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    let query = db.from('check_ins').distinct('user_id').select('user_id').whereNotNull('user_id')
    if (campusId !== null) {
      query = query.whereIn('user_id', db.from('users').select('id').where('campus_id', campusId))
    }
    const rows = await query
    const ids = rows.map((r: any) => Number(r.user_id)).filter(Boolean)
    return response.ok({ data: ids })
  }

  async summary({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const now = DateTime.now().setZone('Asia/Phnom_Penh')

    const userQuery = User.query().where('role', 'user')
    if (campusId !== null) userQuery.where('campus_id', campusId)
    const totalUsers = await userQuery.count('* as total')
    const total = Number((totalUsers[0] as any).$extras.total)

    const checkedInQuery = CheckIn.query()
      .where('year', now.year)
      .where('month', now.month)
      .where('day', now.day)
      .where('scan_type', 'check_in')
    if (campusId !== null) {
      checkedInQuery.whereHas('user', (q) => q.where('campus_id', campusId))
    }
    const checkedInToday = await checkedInQuery.countDistinct('user_id as total')

    const checkedIn = Number((checkedInToday[0] as any).$extras.total)

    return response.ok({
      totalUsers: total,
      checkedIn,
      notCheckedIn: total - checkedIn,
    })
  }
}
