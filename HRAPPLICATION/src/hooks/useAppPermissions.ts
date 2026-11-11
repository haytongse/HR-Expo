import { useEffect, useState, useCallback } from 'react'
import { Platform, PermissionsAndroid, AppState, Linking } from 'react-native'

export interface AppPermissions {
  camera: 'granted' | 'denied' | 'blocked' | 'unavailable'
  notifications: 'granted' | 'denied' | 'blocked' | 'unavailable'
}

const PERM_CAMERA = PermissionsAndroid.PERMISSIONS.CAMERA
const PERM_NOTIF  = 'android.permission.POST_NOTIFICATIONS'

function toStatus(result: string | undefined, apiLevel: number, isNotif = false): AppPermissions['camera'] {
  if (isNotif && apiLevel < 33) return 'granted'
  if (result === 'granted') return 'granted'
  if (result === 'never_ask_again') return 'blocked'
  return 'denied'
}

async function checkAndroid(): Promise<AppPermissions> {
  const apiLevel = parseInt(Platform.Version as string, 10)

  const cameraOk = await PermissionsAndroid.check(PERM_CAMERA).catch(() => false)
  const notifOk  = apiLevel >= 33
    ? await PermissionsAndroid.check(PERM_NOTIF as any).catch(() => false)
    : true

  return {
    camera:        cameraOk ? 'granted' : 'denied',
    notifications: notifOk  ? 'granted' : 'denied',
  }
}

async function requestAndroid(): Promise<AppPermissions> {
  const apiLevel = parseInt(Platform.Version as string, 10)
  const perms: any[] = [PERM_CAMERA]
  if (apiLevel >= 33) perms.push(PERM_NOTIF)

  const results = await PermissionsAndroid.requestMultiple(perms).catch(() => ({} as any))

  return {
    camera:        toStatus(results[PERM_CAMERA], apiLevel),
    notifications: toStatus(results[PERM_NOTIF],  apiLevel, true),
  }
}

export function useAppPermissions() {
  const [permissions, setPermissions] = useState<AppPermissions>({
    camera: 'granted',
    notifications: 'granted',
  })
  const [checked, setChecked] = useState(false)

  const check = useCallback(async () => {
    if (Platform.OS === 'android') {
      const result = await checkAndroid()
      setPermissions(result)
    }
    setChecked(true)
  }, [])

  const request = useCallback(async () => {
    if (Platform.OS === 'android') {
      const result = await requestAndroid()
      setPermissions(result)
    } else {
      Linking.openSettings()
    }
  }, [])

  const openSettings = useCallback(() => Linking.openSettings(), [])

  useEffect(() => {
    check()
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') check()
    })
    return () => sub.remove()
  }, [check])

  const allGranted =
    permissions.camera === 'granted' && permissions.notifications === 'granted'

  return { permissions, checked, allGranted, request, openSettings }
}
