import TimeTable from '#models/time_table'
import type { HttpContext } from '@adonisjs/core/http'

export default class TimetablesController {
  async index({ response }: HttpContext) {
    const timetables = await TimeTable.query().orderBy('shift_schedule_id').orderBy('day_of_week')
    return response.ok(timetables)
  }

  async store({ request, response }: HttpContext) {
    const body = request.all()
    const timetable = await TimeTable.create({
      shiftScheduleId: body.shift_schedule_id ?? body.shiftScheduleId ?? null,
      dayOfWeek:       body.day_of_week       ?? body.dayOfWeek       ?? 0,
      label:           String(body.label ?? ''),
      startTime:       body.start_time        ?? body.startTime        ?? null,
      endTime:         body.end_time          ?? body.endTime          ?? null,
    })
    return response.created(timetable)
  }

  async update({ params, request, response }: HttpContext) {
    const timetable = await TimeTable.findOrFail(params.id)
    const body = request.all()
    timetable.merge({
      shiftScheduleId: body.shift_schedule_id ?? body.shiftScheduleId ?? timetable.shiftScheduleId,
      dayOfWeek:       body.day_of_week       ?? body.dayOfWeek       ?? timetable.dayOfWeek,
      label:           body.label             ?? timetable.label,
      startTime:       body.start_time        ?? body.startTime        ?? timetable.startTime,
      endTime:         body.end_time          ?? body.endTime          ?? timetable.endTime,
    })
    await timetable.save()
    return response.ok(timetable)
  }

  async destroy({ params, response }: HttpContext) {
    const timetable = await TimeTable.findOrFail(params.id)
    await timetable.delete()
    return response.ok({ message: 'Deleted successfully' })
  }
}
