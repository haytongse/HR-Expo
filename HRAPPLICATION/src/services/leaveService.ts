import api from './api'
import { UserPermission } from '../models'

export interface LeaveType {
  id: number
  name: string
  description?: string | null
  maxDays?: number | null
}

export const leaveService = {
  async getMyLeaves(status?: string): Promise<UserPermission[]> {
    const res = await api.get('/permissions', { params: status ? { status } : undefined })
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async getLeaveTypes(): Promise<LeaveType[]> {
    const res = await api.get('/leave-types')
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async createLeave(data: {
    leave_type_id: number
    start_date: string
    end_date: string
    reason?: string
    photos_base64?: string[]
  }): Promise<UserPermission> {
    const res = await api.post('/permissions', data)
    return res.data.data ?? res.data
  },

  async cancelLeave(id: number): Promise<void> {
    await api.delete(`/permissions/${id}`)
  },
}
