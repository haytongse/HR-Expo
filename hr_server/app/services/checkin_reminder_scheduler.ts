import cron from 'node-cron'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { sendPushNotification } from '#services/notification_service'

const REMIND_MINUTES_BEFORE = 15

export function startCheckinReminderScheduler() {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = DateTime.now().setZone('Asia/Phnom_Penh')
      const target = now.plus({ minutes: REMIND_MINUTES_BEFORE })
      const targetTime = target.toFormat('HH:mm') // e.g. "08:15"
      const todayDow = now.weekday % 7 // 0=Sun,1=Mon,...,6=Sat (matches timetable day_of_week)
      const todayStr = now.toISODate()! // e.g. "2025-04-26"

      // Find all users whose shift timetable has a check-in or check-out exactly REMIND_MINUTES_BEFORE from now
      const rows: Array<{
        id: number
        fcm_token: string
        full_name: string | null
        email: string
        label: string
        start_time: string | null
        end_time: string | null
      }> = await db.rawQuery(
        `
        SELECT DISTINCT
          u.id,
          u.fcm_token,
          u.full_name,
          u.email,
          tt.label,
          tt.start_time,
          tt.end_time
        FROM users u
        JOIN (
          SELECT uss.user_id, uss.shift_schedule_id
          FROM user_shift_schedules uss
          WHERE uss.id = (
            SELECT MAX(id) FROM user_shift_schedules WHERE user_id = uss.user_id
          )
        ) latest ON latest.user_id = u.id
        JOIN shift_schedules ss ON ss.id = latest.shift_schedule_id
        JOIN time_tables tt ON tt.shift_schedule_id = ss.id
        WHERE u.status != '0'
          AND u.fcm_token IS NOT NULL
          AND tt.day_of_week = ?
          AND (SUBSTR(tt.start_time, 1, 5) = ? OR SUBSTR(tt.end_time, 1, 5) = ?)
          AND ss.start_date <= ?
          AND ss.end_date >= ?
        `,
        [todayDow, targetTime, targetTime, todayStr, todayStr]
      )

      for (const row of rows) {
        if (!row.fcm_token) continue

        const isCheckin =
          row.start_time && row.start_time.slice(0, 5) === targetTime

        const title = isCheckin ? 'Check-in Reminder' : 'Check-out Reminder'
        const body = `${row.label} ${isCheckin ? 'starts' : 'ends'} in ${REMIND_MINUTES_BEFORE} minutes`
        const type = isCheckin ? 'checkin_reminder' : 'checkout_reminder'

        await sendPushNotification(row.fcm_token, title, body, { type })
      }
    } catch (err) {
      console.error('[CheckinReminder] Scheduler error:', err)
    }
  })

  console.log(
    `[CheckinReminder] Started — reminders fire ${REMIND_MINUTES_BEFORE} min before check-in/check-out`
  )
}
