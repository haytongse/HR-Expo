import cron from 'node-cron'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Announcement from '#models/announcement'
import { sendPushNotifications } from '#services/notification_service'

export function startAnnouncementNotificationScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const nowUtc = DateTime.now().toUTC().toSQL()!

      // Find scheduled announcements that are due and not yet notified
      const pending = await Announcement.query()
        .whereNotNull('scheduled_at')
        .where('scheduled_at', '<=', nowUtc)
        .where('notified', false)

      if (pending.length === 0) return

      // Get all users' FCM tokens
      const rows: { fcm_token: string }[] = await db
        .from('users')
        .whereNotNull('fcm_token')
        .select('fcm_token')

      const tokens = rows.map((r) => r.fcm_token).filter(Boolean)

      for (const announcement of pending) {
        if (tokens.length > 0) {
          await sendPushNotifications(
            tokens,
            announcement.title,
            announcement.body ?? 'New announcement posted',
            { type: 'announcement', id: String(announcement.id) }
          )
        }

        // Mark as notified so we don't send again
        announcement.notified = true
        await announcement.save()

        console.log(`[Announcement] Notification sent for announcement #${announcement.id}: "${announcement.title}"`)
      }
    } catch (e) {
      console.error('[Announcement] Scheduler error:', e)
    }
  })

  console.log('[Announcement] Notification scheduler started')
}
