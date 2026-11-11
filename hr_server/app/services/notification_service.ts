import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

let messagingInstance: any = null

async function getMessaging(): Promise<any> {
  if (messagingInstance) return messagingInstance

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  if (!serviceAccountPath) {
    console.error('[FCM] FIREBASE_SERVICE_ACCOUNT_PATH is not set in .env')
    return null
  }

  try {
    const absolutePath = resolve(process.cwd(), serviceAccountPath)
    console.log('[FCM] Loading service account from:', absolutePath)
    const serviceAccount = JSON.parse(readFileSync(absolutePath, 'utf8'))
    console.log('[FCM] Service account project_id:', serviceAccount.project_id)

    const { initializeApp, getApps, cert } = await import('firebase-admin/app')
    const firebaseMessaging = await import('firebase-admin/messaging')
    const app =
      getApps().length > 0 ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) })
    messagingInstance = firebaseMessaging.getMessaging(app)
    console.log('[FCM] Firebase Admin initialized successfully')
    return messagingInstance
  } catch (e) {
    console.error('[FCM] Failed to initialize Firebase Admin:', e)
    return null
  }
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const messaging = await getMessaging()
  if (!messaging) {
    console.error('[FCM] Messaging not initialized — notification not sent')
    return
  }
  if (!fcmToken) {
    console.error('[FCM] No FCM token provided')
    return
  }

  try {
    console.log('[FCM] Sending to token:', fcmToken.slice(0, 20) + '...')
    const messageId = await messaging.send({
      token: fcmToken,
      notification: body ? { title, body } : { title },
      data: data ?? {},
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'hr_default' },
      },
      apns: {
        headers: {
          'apns-priority': '10',
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            alert: body ? { title, body } : { title },
            sound: 'default',
            badge: 1,
            'content-available': 1,
            'mutable-content': 1,
          },
        },
      },
    })
    console.log('[FCM] Delivered! message_id:', messageId)
  } catch (e: any) {
    console.error('[FCM] Send error:', e?.message ?? e)
  }
}

export async function sendPushNotifications(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const valid = fcmTokens.filter(Boolean)
  if (!valid.length) return
  await Promise.all(valid.map((token) => sendPushNotification(token, title, body, data)))
}
