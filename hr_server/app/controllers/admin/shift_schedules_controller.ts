import ShiftSchedule from '#models/shift_schedule'
import UserShiftSchedule from '#models/user_shift_schedule'
import TimeTable from '#models/time_table'
import type { HttpContext } from '@adonisjs/core/http'

export default class ShiftSchedulesController {
  async index({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = ShiftSchedule.query().orderBy('created_at', 'desc')
    if (campusId !== null) query.where('campus_id', campusId)
    const shifts = await query
    return response.ok(shifts)
  }

  async show({ params, response }: HttpContext) {
    const shift = await ShiftSchedule.findOrFail(params.id)
    const timeTables = await TimeTable.query().where('shift_schedule_id', shift.id).orderBy('day_of_week')
    return response.ok({ ...shift.toJSON(), timeTables })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = request.only([
      'name', 'startDate', 'endDate', 'weeklyRules',
      'allowTimeBefore', 'allowTimeAfter',
      'allowAmountScan', 'allowTimeSecondScan',
    ])
    const campusId = user.campusId ? Number(user.campusId) : null
    const shift = await ShiftSchedule.create({ ...data, createdBy: user.id, campusId })
    return response.created(shift)
  }

  async update({ params, request, response }: HttpContext) {
    const shift = await ShiftSchedule.findOrFail(params.id)
    const data = request.only([
      'name', 'startDate', 'endDate', 'weeklyRules',
      'allowTimeBefore', 'allowTimeAfter',
      'allowAmountScan', 'allowTimeSecondScan',
    ])
    shift.merge(data)
    await shift.save()
    return response.ok(shift)
  }

  async destroy({ params, response }: HttpContext) {
    const shift = await ShiftSchedule.findOrFail(params.id)
    await shift.delete()
    return response.ok({ message: 'Deleted successfully' })
  }

  async assignUser({ params, request, response }: HttpContext) {
    const { user_id } = request.only(['user_id'])
    await ShiftSchedule.findOrFail(params.id)

    // Remove existing assignment
    await UserShiftSchedule.query().where('user_id', user_id).delete()

    const assignment = await UserShiftSchedule.create({
      userId: user_id,
      shiftScheduleId: params.id,
    })
    return response.created(assignment)
  }

  async unassignUser({ params, response }: HttpContext) {
    await UserShiftSchedule.query()
      .where('shift_schedule_id', params.id)
      .where('user_id', params.userId)
      .delete()
    return response.ok({ message: 'User removed from shift' })
  }
}
