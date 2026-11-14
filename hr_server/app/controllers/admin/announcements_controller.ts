import Announcement from '#models/announcement'
import AnnouncementPhoto from '#models/announcement_photo'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

async function savePhotos(base64List: string[]): Promise<string[]> {
  const app = (await import('@adonisjs/core/services/app')).default
  const fs = await import('node:fs/promises')
  const uploadDir = app.makePath('public/announcements')
  await fs.mkdir(uploadDir, { recursive: true })

  const paths: string[] = []
  for (const b64 of base64List) {
    try {
      const clean = b64.replace(/^data:image\/\w+;base64,/, '')
      const filename = `ann_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const fullPath = `${uploadDir}/${filename}`
      await fs.writeFile(fullPath, Buffer.from(clean, 'base64'))
      paths.push(`/announcements/${filename}`)
    } catch {}
  }
  return paths
}

export default class AnnouncementsController {
  async index({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = Announcement.query().preload('photos').preload('createdByUser').orderBy('created_at', 'desc')
    if (campusId !== null) query.where('campus_id', campusId)
    const announcements = await query
    return response.ok(announcements)
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { title, body, scheduled_at, photos_base64 } = request.only([
      'title', 'body', 'scheduled_at', 'photos_base64',
    ])

    if (!title) return response.badRequest({ message: 'Title is required' })

    const campusId = user.campusId ? Number(user.campusId) : null
    const announcement = await Announcement.create({
      title: String(title),
      body: body ? String(body) : null,
      scheduledAt: scheduled_at ? DateTime.fromISO(String(scheduled_at)).toUTC() : null,
      createdBy: Number(user.id),
      campusId,
    } as any)

    const base64List: string[] = Array.isArray(photos_base64) ? photos_base64 : []
    if (base64List.length > 0) {
      const savedPaths = await savePhotos(base64List)
      for (const photoPath of savedPaths) {
        await AnnouncementPhoto.create({ announcementId: announcement.id, photoPath })
      }
    }

    await announcement.load('photos')

    // Mark as read for the creator so it doesn't appear as unread for the admin
    await db
      .table('announcement_reads')
      .insert({ user_id: user.id, announcement_id: announcement.id })
      .onConflict(['user_id', 'announcement_id'])
      .ignore()

    return response.created(announcement)
  }

  async destroy({ params, response }: HttpContext) {
    const announcement = await Announcement.find(params.id)
    if (!announcement) return response.notFound({ message: 'Announcement not found' })
    await announcement.delete()
    return response.ok({ message: 'Deleted' })
  }
}
