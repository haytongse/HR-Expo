import LeaveType from '#models/leave_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class LeaveTypesController {
  async index({ response }: HttpContext) {
    const types = await LeaveType.query().where('status', 'active').orderBy('created_at', 'asc')
    return response.ok({ data: types })
  }
}
