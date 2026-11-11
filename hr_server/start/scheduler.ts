import { startCheckinReminderScheduler } from '#services/checkin_reminder_scheduler'
import { startAnnouncementNotificationScheduler } from '#services/announcement_notification_scheduler'

startCheckinReminderScheduler()
startAnnouncementNotificationScheduler()
