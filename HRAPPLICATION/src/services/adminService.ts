import api from './api'
import { User, ShiftSchedule, TimeTable, AttendanceSummary, Campus, PublicHoliday, UserPermission } from '../models'

export interface LeaveType {
  id: number
  name: string
  description?: string | null
  maxDays?: number | null
}

export interface Announcement {
  id: number
  title: string
  content: string
  createdAt: string
}

function normalizeUser(raw: any): User {
  return {
    ...raw,
    allowWifi:    raw.allowWifi    ?? raw.allow_wifi    ?? null,
    noCheckOut:   raw.noCheckOut   ?? raw.no_check_out  ?? null,
    allowOutside: raw.allowOutside ?? raw.allow_outside ?? null,
  }
}

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await api.get('/admin/users')
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data.map(normalizeUser) : data
  },
  async createUser(data: { fullName?: string; email: string; password: string; role: string; phoneNumber?: string; address?: string; birthOfDate?: string; campusId?: number | null; status?: string; userCode?: string; allowWifi?: boolean; noCheckOut?: boolean; allowOutside?: boolean }) {
    const res = await api.post('/admin/users', {
      // send both camelCase and snake_case to support either backend convention
      fullName: data.fullName,       full_name: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      phoneNumber: data.phoneNumber, phone_number: data.phoneNumber,
      address: data.address,
      birthOfDate: data.birthOfDate, birth_of_date: data.birthOfDate,
      campusId: data.campusId,       campus_id: data.campusId,
      status: data.status,
      userCode: data.userCode,       user_code: data.userCode,
      allowWifi: data.allowWifi,     allow_wifi: data.allowWifi,
      noCheckOut: data.noCheckOut,   no_check_out: data.noCheckOut,
      allowOutside: data.allowOutside, allow_outside: data.allowOutside,
    })
    return normalizeUser(res.data.data ?? res.data)
  },
  async updateUser(id: number, data: { fullName?: string; email?: string; role?: string; password?: string; phoneNumber?: string; address?: string; birthOfDate?: string; status?: string; campusId?: number | null; userCode?: string; allowWifi?: boolean; noCheckOut?: boolean; allowOutside?: boolean }) {
    const res = await api.put(`/admin/users/${id}`, {
      // send both camelCase and snake_case to support either backend convention
      fullName: data.fullName,       full_name: data.fullName,
      email: data.email,
      password: data.password,
      role: data.role,
      phoneNumber: data.phoneNumber, phone_number: data.phoneNumber,
      address: data.address,
      birthOfDate: data.birthOfDate, birth_of_date: data.birthOfDate,
      campusId: data.campusId,       campus_id: data.campusId,
      status: data.status,
      userCode: data.userCode,       user_code: data.userCode,
      allowWifi: data.allowWifi,     allow_wifi: data.allowWifi,
      noCheckOut: data.noCheckOut,   no_check_out: data.noCheckOut,
      allowOutside: data.allowOutside, allow_outside: data.allowOutside,
    })
    return normalizeUser(res.data.data ?? res.data)
  },
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`)
  },

  async getCampuses(): Promise<Campus[]> {
    const res = await api.get('/admin/campuses')
    return res.data.data ?? res.data
  },
  async createCampus(data: Partial<Campus>) {
    const res = await api.post('/admin/campuses', data)
    return res.data.data ?? res.data
  },
  async updateCampus(id: number, data: Partial<Campus>) {
    const res = await api.put(`/admin/campuses/${id}`, data)
    return res.data.data ?? res.data
  },
  async deleteCampus(id: number): Promise<void> {
    await api.delete(`/admin/campuses/${id}`)
  },

  async getShifts(): Promise<ShiftSchedule[]> {
    const res = await api.get('/admin/shifts')
    return res.data.data ?? res.data
  },
  async createShift(data: Partial<ShiftSchedule>) {
    const res = await api.post('/admin/shifts', data)
    return res.data.data ?? res.data
  },
  async updateShift(id: number, data: Partial<ShiftSchedule>) {
    const res = await api.put(`/admin/shifts/${id}`, data)
    return res.data.data ?? res.data
  },
  async deleteShift(id: number): Promise<void> {
    await api.delete(`/admin/shifts/${id}`)
  },
  async assignUserToShift(shiftId: number, userId: number) {
    try {
      const res = await api.post(`/admin/shifts/${shiftId}/assign`, { user_id: userId })
      console.log('[Shift] assigned:', res.data)
      return res.data.data ?? res.data
    } catch (e: any) {
      console.log('[Shift] assign failed:', e?.response?.status, JSON.stringify(e?.response?.data))
      throw e
    }
  },

  async getTimetables(): Promise<TimeTable[]> {
    const res = await api.get('/admin/timetables')
    return res.data.data ?? res.data
  },
  async createTimetable(data: Partial<TimeTable>) {
    const res = await api.post('/admin/timetables', data)
    return res.data.data ?? res.data
  },
  async updateTimetable(id: number, data: Partial<TimeTable>) {
    const res = await api.put(`/admin/timetables/${id}`, data)
    return res.data.data ?? res.data
  },
  async deleteTimetable(id: number): Promise<void> {
    await api.delete(`/admin/timetables/${id}`)
  },

  async getCheckInUserIds(): Promise<number[]> {
    const res = await api.get('/admin/check-ins/user-ids')
    return res.data.data ?? res.data
  },
  async getAllCheckIns(params?: { date?: string; user_id?: number; page?: number }) {
    const res = await api.get('/admin/check-ins', { params })
    return res.data.data ?? res.data
  },
  async getMonthlyCheckIns(year?: number, month?: number, user_id?: number) {
    const res = await api.get('/admin/check-ins/monthly', { params: { year, month, user_id } })
    return res.data.data ?? res.data
  },
  async getSummary(): Promise<AttendanceSummary> {
    const res = await api.get('/admin/check-ins/summary')
    return res.data.data ?? res.data
  },


  async getAllDailyWorks(params?: { year?: number; month?: number; user_id?: number; page?: number }) {
    const res = await api.get('/admin/daily-works', { params })
    return res.data.data ?? res.data
  },
  async getMonthlyDailyWorks(year?: number, month?: number, user_id?: number) {
    const res = await api.get('/admin/daily-works/monthly', { params: { year, month, user_id } })
    return res.data.data ?? res.data
  },
  async approveDailyWork(id: number) {
    const res = await api.put(`/admin/daily-works/${id}/approve`)
    return res.data.data ?? res.data
  },
  async rejectDailyWork(id: number) {
    const res = await api.put(`/admin/daily-works/${id}/reject`)
    return res.data.data ?? res.data
  },

  async addCampusWifi(campusId: number, wifiName: string) {
    const res = await api.post(`/admin/campuses/${campusId}/wifis`, { wifi_name: wifiName })
    return res.data.data ?? res.data
  },
  async deleteCampusWifi(campusId: number, wifiId: number): Promise<void> {
    await api.delete(`/admin/campuses/${campusId}/wifis/${wifiId}`)
  },

  // ── Public Holidays ────────────────────────────────────────────────────────
  async getPublicHolidays(year?: number): Promise<PublicHoliday[]> {
    const res = await api.get('/admin/public-holidays', { params: { year } })
    return res.data.data ?? res.data
  },
  async createPublicHoliday(data: Partial<PublicHoliday>) {
    const res = await api.post('/admin/public-holidays', data)
    return res.data.data ?? res.data
  },
  async updatePublicHoliday(id: number, data: Partial<PublicHoliday>) {
    const res = await api.put(`/admin/public-holidays/${id}`, data)
    return res.data.data ?? res.data
  },
  async deletePublicHoliday(id: number): Promise<void> {
    await api.delete(`/admin/public-holidays/${id}`)
  },

  // ── Leave Requests (Permissions) ───────────────────────────────────────────
  async getPermissions(params?: { status?: string }): Promise<UserPermission[]> {
    const res = await api.get('/admin/permissions', { params })
    return res.data.data ?? res.data
  },
  async approvePermission(id: number, notes?: string) {
    const res = await api.put(`/admin/permissions/${id}/approve`, { notes })
    return res.data.data ?? res.data
  },
  async rejectPermission(id: number, notes?: string) {
    const res = await api.put(`/admin/permissions/${id}/reject`, { notes })
    return res.data.data ?? res.data
  },

  // ── Leave Types ────────────────────────────────────────────────────────────
  async getLeaveTypes(): Promise<LeaveType[]> {
    const res = await api.get('/admin/leave-types')
    return res.data.data ?? res.data
  },
  async createLeaveType(data: Partial<LeaveType>) {
    const res = await api.post('/admin/leave-types', data)
    return res.data.data ?? res.data
  },
  async updateLeaveType(id: number, data: Partial<LeaveType>) {
    const res = await api.put(`/admin/leave-types/${id}`, data)
    return res.data.data ?? res.data
  },
  async deleteLeaveType(id: number): Promise<void> {
    await api.delete(`/admin/leave-types/${id}`)
  },

  // ── Announcements ──────────────────────────────────────────────────────────
  async getAnnouncements(): Promise<Announcement[]> {
    const res = await api.get('/admin/announcements')
    return res.data.data ?? res.data
  },
  async createAnnouncement(data: Pick<Announcement, 'title' | 'content'>) {
    const res = await api.post('/admin/announcements', data)
    return res.data.data ?? res.data
  },
  async deleteAnnouncement(id: number): Promise<void> {
    await api.delete(`/admin/announcements/${id}`)
  },
}
