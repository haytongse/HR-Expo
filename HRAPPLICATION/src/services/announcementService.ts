import api, { SERVER_URL } from './api'

export type AnnouncementPhoto = { id: number; announcementId: number; photoPath: string }

export type Announcement = {
  id: number
  title: string
  body: string | null
  scheduledAt: string | null
  createdBy: number | null
  createdByUser?: { fullName?: string; email?: string } | null
  createdAt: string
  isRead: boolean
  photos: AnnouncementPhoto[]
}

export const announcementService = {
  async adminGetAll(): Promise<Announcement[]> {
    const res = await api.get('/admin/announcements')
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async getAll(): Promise<Announcement[]> {
    const res = await api.get('/announcements')
    const data = res.data.data ?? res.data
    return Array.isArray(data) ? data : []
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get('/announcements/unread-count')
    return res.data.unread ?? 0
  },

  async markAllRead(): Promise<void> {
    await api.post('/announcements/read-all')
  },

  async markRead(id: number): Promise<void> {
    await api.post(`/announcements/${id}/read`)
  },

  async create(payload: {
    title: string
    body?: string
    scheduled_at?: string | null
    photos_base64?: string[]
  }): Promise<Announcement> {
    const res = await api.post('/admin/announcements', payload)
    return res.data.data ?? res.data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/admin/announcements/${id}`)
  },

  photoUrl(path: string): string {
    return `${SERVER_URL}${path}`
  },
}
