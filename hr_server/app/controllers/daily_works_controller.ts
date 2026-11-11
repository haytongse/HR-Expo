import DailyWork from '#models/daily_work'
import DailyWorkPhoto from '#models/daily_work_photo'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { join } from 'node:path'
import { writeFile, mkdir } from 'node:fs/promises'
import { sendPushNotifications } from '#services/notification_service'

export default class DailyWorksController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const year  = request.input('year')  ? Number(request.input('year'))  : null
    const month = request.input('month') ? Number(request.input('month')) : null

    const query = DailyWork.query()
      .where('user_id', user.id)
      .preload('campus')
      .preload('approver')
      .preload('photos')
      .orderBy('created_at', 'desc')

    if (year)  query.where('year', year)
    if (month) query.where('month', month)

    const records = await query
    return response.ok(records)
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()

    const campusId    = request.input('campus_id') ? Number(request.input('campus_id')) : null
    const year        = Number(request.input('year'))
    const month       = Number(request.input('month'))
    const day         = Number(request.input('day'))
    const time        = String(request.input('time', DateTime.now().setZone('Asia/Phnom_Penh').toFormat('HH:mm')))
    const description = request.input('description', null) as string | null
    const lat = request.input('lat') ? Number(request.input('lat')) : null
    const lng = request.input('lng') ? Number(request.input('lng')) : null

    // Support multiple photos via photos_base64 array, fallback to single photo_base64
    const photosBase64: string[] = (() => {
      const arr = request.input('photos_base64', null)
      if (Array.isArray(arr) && arr.length > 0) return arr
      const single = request.input('photo_base64', null)
      if (single) return [single]
      return []
    })()

    const record = await DailyWork.create({
      userId: user.id,
      campusId,
      year,
      month,
      day,
      time,
      description,
      photoPath: null,
      lat,
      lng,
    })

    // Save each photo and create DailyWorkPhoto records
    if (photosBase64.length > 0) {
      try {
        const dir = join(process.cwd(), 'public', 'daily-works')
        await mkdir(dir, { recursive: true })
        for (const b64 of photosBase64) {
          const filename = `daily_work_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`
          const buffer = Buffer.from(b64.replace(/^data:image\/\w+;base64,/, ''), 'base64')
          await writeFile(join(dir, filename), buffer)
          await DailyWorkPhoto.create({ dailyWorkId: record.id, photoPath: `/daily-works/${filename}` })
        }
      } catch (err) {
        console.error('[DailyWork.store] photo save error:', err)
      }
    }

    await record.load('campus')
    await record.load('photos')

    // Notify admins about new daily work submission
    const userName = user.fullName || user.email
    const dateStr  = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
    const admins   = await User.query().where('role', 'admin')
    const tokens   = admins.map((a) => a.fcmToken).filter(Boolean) as string[]
    if (tokens.length) {
      await sendPushNotifications(tokens, '📋 New Daily Work', `${userName} submitted a daily work for ${dateStr}`, { type: 'daily_work_admin' })
    }

    return response.created(record)
  }
}
