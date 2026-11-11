import PublicHoliday from '#models/public_holiday'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class PublicHolidaysController {
  async index({ request, response }: HttpContext) {
    const year = request.input('year', DateTime.now().setZone('Asia/Phnom_Penh').year)
    const holidays = await PublicHoliday.query()
      .where('year', Number(year))
      .orderBy('date', 'asc')
    return response.ok({ data: holidays })
  }
}
