import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { authService } from './authService'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync()
    if (existing === 'granted') return true
    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  },

  async registerToken(): Promise<void> {
    try {
      const granted = await notificationService.requestPermission()
      if (!granted) return

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'HR Notifications',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
        })
      }

      const token = await Notifications.getExpoPushTokenAsync()
      await authService.registerFcmToken(token.data)
    } catch {}
  },

  setupListeners(): () => void {
    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notification received]', notification)
    })
    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notification tapped]', response)
    })
    return () => {
      sub1.remove()
      sub2.remove()
    }
  },
}
