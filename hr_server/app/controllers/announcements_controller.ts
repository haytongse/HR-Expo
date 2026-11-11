import Announcement from '#models/announcement'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class AnnouncementsController {
  async index({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const nowUtc = DateTime.now().toUTC()

    const announcements = await Announcement.query()
      .preload('photos')
      .preload('createdByUser')
      .where((q) => {
        q.whereNull('scheduled_at').orWhere('scheduled_at', '<=', nowUtc.toSQL()!)
      })
      .orderBy('created_at', 'desc')

    // Fetch which ones the user has already read
    const reads = await db
      .from('announcement_reads')
      .where('user_id', user.id)
      .select('announcement_id')

    const readSet = new Set(reads.map((r: { announcement_id: number }) => r.announcement_id))

    const data = announcements.map((a) => ({
      ...a.serialize(),
      isRead: readSet.has(a.id),
    }))

    return response.ok(data)
  }

  async unreadCount({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const nowUtc = DateTime.now().toUTC()

    const unreadRows = await Announcement.query()
      .where((q) => {
        q.whereNull('scheduled_at').orWhere('scheduled_at', '<=', nowUtc.toSQL()!)
      })
      .whereNotIn(
        'id',
        db.from('announcement_reads').where('user_id', user.id).select('announcement_id')
      )
      .count('* as total')
      .first()

    const unread = Number((unreadRows as any)?.$extras?.total ?? 0)

    return response.ok({ unread })
  }

  async markRead({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const announcementId = Number(params.id)

    await db
      .table('announcement_reads')
      .insert({ user_id: user.id, announcement_id: announcementId })
      .onConflict(['user_id', 'announcement_id'])
      .ignore()

    return response.ok({ ok: true })
  }

  async markAllRead({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const nowUtc = DateTime.now().toUTC()

    const announcements = await Announcement.query()
      .where((q) => {
        q.whereNull('scheduled_at').orWhere('scheduled_at', '<=', nowUtc.toSQL()!)
      })
      .select('id')

    if (announcements.length > 0) {
      const rows = announcements.map((a) => ({
        user_id: user.id,
        announcement_id: a.id,
      }))
      await db.table('announcement_reads').insert(rows).onConflict(['user_id', 'announcement_id']).ignore()
    }

    return response.ok({ ok: true })
  }
}
