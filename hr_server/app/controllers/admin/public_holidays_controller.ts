import PublicHoliday from '#models/public_holiday'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class AdminPublicHolidaysController {
  private serialize(h: PublicHoliday) {
    return {
      id: h.id,
      name: h.name,
      date: h.date,
      amountDay: h.amountDay,
      amount_day: h.amountDay,
      description: h.description,
      year: h.year,
      month: h.month,
      day: h.day,
      createdAt: h.createdAt,
    }
  }

  async index({ auth, request, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const year = request.input('year', null)
    const query = PublicHoliday.query().orderBy('date', 'asc')
    if (year) query.where('year', Number(year))
    if (campusId !== null) query.where('campus_id', campusId)
    const holidays = await query
    return response.ok({ data: holidays.map(h => this.serialize(h)) })
  }

  async store({ auth, request, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ? Number(admin.campusId) : null
    const d = request.only(['name', 'date', 'amount_day', 'amountDay', 'description'])

    if (!d.name || !d.date) {
      return response.badRequest({ message: 'name and date are required' })
    }

    const dt = DateTime.fromISO(String(d.date)).setZone('Asia/Phnom_Penh')
    if (!dt.isValid) return response.badRequest({ message: 'Invalid date format' })

    const rawAmountDay = d.amountDay ?? d.amount_day
    const holiday = await PublicHoliday.create({
      name: String(d.name),
      date: dt.toISODate()!,
      amountDay: rawAmountDay ? Number(rawAmountDay) : 1,
      description: d.description ? String(d.description) : null,
      year: dt.year,
      month: dt.month,
      day: dt.day,
      campusId,
    })

    return response.created({ data: this.serialize(holiday) })
  }

  async update({ params, request, response }: HttpContext) {
    const holiday = await PublicHoliday.find(Number(params.id))
    if (!holiday) return response.notFound({ message: 'Holiday not found' })

    const d = request.only(['name', 'date', 'amount_day', 'amountDay', 'description'])
    const rawAmountDay = d.amountDay ?? d.amount_day

    if (d.name) holiday.name = String(d.name)
    if (d.description !== undefined) holiday.description = d.description ? String(d.description) : null
    if (rawAmountDay !== undefined) holiday.amountDay = Number(rawAmountDay)

    if (d.date) {
      const dt = DateTime.fromISO(String(d.date)).setZone('Asia/Phnom_Penh')
      if (!dt.isValid) return response.badRequest({ message: 'Invalid date format' })
      holiday.date = dt.toISODate()!
      holiday.year = dt.year
      holiday.month = dt.month
      holiday.day = dt.day
    }

    await holiday.save()
    return response.ok({ data: this.serialize(holiday) })
  }

  async destroy({ params, response }: HttpContext) {
    const holiday = await PublicHoliday.find(Number(params.id))
    if (!holiday) return response.notFound({ message: 'Holiday not found' })
    await holiday.delete()
    return response.ok({ message: 'Deleted' })
  }
}
