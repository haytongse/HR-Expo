import LeaveType from '#models/leave_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminLeaveTypesController {
  async index({ response }: HttpContext) {
    const types = await LeaveType.query().orderBy('created_at', 'asc')
    return response.ok({ data: types.map(lt => this.serialize(lt)) })
  }

  private serialize(lt: LeaveType) {
    return {
      id: lt.id,
      name: lt.name,
      maxDays: lt.amount ?? null,
      max_days: lt.amount ?? null,
      amount: lt.amount,
      description: (lt as any).description ?? null,
      status: (lt as any).status,
      createdAt: lt.createdAt,
      updatedAt: lt.updatedAt,
    }
  }

  async store({ request, response }: HttpContext) {
    const d = request.only(['name', 'maxDays', 'max_days', 'amount', 'description', 'status'])
    if (!d.name) return response.badRequest({ message: 'name is required' })
    const rawAmount = d.maxDays ?? d.max_days ?? d.amount
    const leaveType = await LeaveType.create({
      name: String(d.name).trim(),
      amount: rawAmount != null ? Number(rawAmount) : 0,
      status: d.status === 'inactive' ? 'inactive' : 'active',
    })
    return response.created({ data: this.serialize(leaveType) })
  }

  async update({ params, request, response }: HttpContext) {
    const leaveType = await LeaveType.find(Number(params.id))
    if (!leaveType) return response.notFound({ message: 'Leave type not found' })
    const d = request.only(['name', 'maxDays', 'max_days', 'amount', 'description', 'status'])
    const rawAmount = d.maxDays ?? d.max_days ?? d.amount
    if (d.name !== undefined) leaveType.name = String(d.name).trim()
    if (rawAmount !== undefined) leaveType.amount = rawAmount != null ? Number(rawAmount) : 0
    if (d.status !== undefined) leaveType.status = d.status === 'inactive' ? 'inactive' : 'active'
    await leaveType.save()
    return response.ok({ data: this.serialize(leaveType) })
  }

  async destroy({ params, response }: HttpContext) {
    const leaveType = await LeaveType.find(Number(params.id))
    if (!leaveType) return response.notFound({ message: 'Leave type not found' })
    await leaveType.delete()
    return response.ok({ message: 'Deleted' })
  }
}
