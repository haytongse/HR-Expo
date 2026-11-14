import api from './api'

export interface UserNote {
  id: number
  date: string
  title: string | null
  body: string
  photoPath: string | null
  createdAt: string
  updatedAt: string | null
}

export const notesService = {
  async getMonthNotes(year: number, month: number): Promise<UserNote[]> {
    const res = await api.get('/notes', { params: { year, month } })
    const d = res.data.data ?? res.data
    return Array.isArray(d) ? d : []
  },

  async createNote(data: {
    date: string
    title?: string
    body: string
    photo_base64?: string
  }): Promise<UserNote> {
    const res = await api.post('/notes', data)
    return res.data.data ?? res.data
  },

  async updateNote(id: number, data: {
    title?: string
    body?: string
    photo_base64?: string
  }): Promise<UserNote> {
    const res = await api.put(`/notes/${id}`, data)
    return res.data.data ?? res.data
  },

  async deleteNote(id: number): Promise<void> {
    await api.delete(`/notes/${id}`)
  },
}
