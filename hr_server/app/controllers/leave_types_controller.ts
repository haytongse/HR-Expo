import LeaveType from '#models/leave_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class LeaveTypesController {
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const campusId = user.campusId ?? null
    const query = LeaveType.query().where('status', 'active').orderBy('created_at', 'asc')
    if (campusId !== null) query.where('campus_id', campusId)
    const types = await query
    return response.ok({ data: types })
  }
}
