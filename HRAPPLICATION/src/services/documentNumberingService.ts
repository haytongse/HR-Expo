import api from './api'

export interface DocNumberConfig {
  id: string        // unique key / prefix, e.g. 'EMP'
  label: string     // display name, e.g. 'Employee Code'
  prefix: string    // e.g. 'EMP'
  separator: string // e.g. '' or '-'
  padding: number   // digit length, e.g. 3 → '001'
  nextNumber: number
}

function format(cfg: DocNumberConfig): string {
  return `${cfg.prefix}${cfg.separator}${String(cfg.nextNumber).padStart(cfg.padding, '0')}`
}

export const documentNumberingService = {
  async getAll(): Promise<DocNumberConfig[]> {
    try {
      const res = await api.get('/admin/document-numbering')
      return res.data.data ?? res.data
    } catch {
      return []
    }
  },

  async save(cfg: DocNumberConfig): Promise<void> {
    const res = await api.put(`/admin/document-numbering/${cfg.id}`, cfg)
    return res.data.data ?? res.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin/document-numbering/${id}`)
  },

  // Returns next formatted code WITHOUT incrementing
  async preview(id: string): Promise<string | null> {
    try {
      const res = await api.get(`/admin/document-numbering/${id}/preview`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // Returns next formatted code AND increments the counter on the server
  async consume(id: string): Promise<string | null> {
    try {
      const res = await api.post(`/admin/document-numbering/${id}/consume`)
      return res.data.data ?? res.data
    } catch {
      return null
    }
  },

  // Decrement counter (undo a consume, e.g. user creation failed)
  async undo(id: string): Promise<void> {
    try {
      await api.post(`/admin/document-numbering/${id}/undo`)
    } catch {}
  },

  format,
}
