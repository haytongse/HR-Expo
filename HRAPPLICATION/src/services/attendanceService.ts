import api from './api'

export const attendanceService = {
  async getTodayCheckIns() {
    const res = await api.get('/check-ins/today')
    return res.data.data ?? res.data
  },

  async getMonthlySummary(year?: number, month?: number) {
    const params: Record<string, number> = {}
    if (year)  params.year  = year
    if (month) params.month = month
    const res = await api.get('/check-ins/monthly-summary', { params })
    return res.data.data ?? res.data
  },

  async getCampuses() {
    const res = await api.get('/campuses')
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async checkIn(data: {
    campus_code: string
    latitude: number
    longitude: number
    scan_type?: 'check_in' | 'check_out'
    address?: string | null
    street?: string | null
    village?: string | null
    sangkat?: string | null
    district?: string | null
    city?: string | null
    country?: string | null
  }) {
    const res = await api.post('/check-ins', data)
    return res.data.data ?? res.data
  },

  async getMyDailyWorks(year?: number, month?: number) {
    const params: Record<string, number> = {}
    if (year)  params.year  = year
    if (month) params.month = month
    const res = await api.get('/daily-works', { params })
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async createDailyWork(data: {
    year: number
    month: number
    day: number
    time?: string
    description?: string
    photos_base64?: string[]
    campus_id?: number | null
  }) {
    const res = await api.post('/daily-works', data)
    return res.data.data ?? res.data
  },
}
