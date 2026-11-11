import AsyncStorage from '@react-native-async-storage/async-storage'
import api from './api'

export interface LoginResponse {
  token: string
  user: {
    id: number
    fullName: string | null
    email: string
    role: 'admin' | 'user'
    initials: string
    campusId: number | null
    phoneNumber: string | null
    address: string | null
    birthOfDate: string | null
    status: string
    allowWifi?: boolean | null
    noCheckOut?: boolean | null
    allowOutside?: boolean | null
  }
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const res = await api.post('/auth/login', { identifier, password })
    const data: LoginResponse = res.data.data ?? res.data
    await AsyncStorage.setItem('access_token', data.token)
    return data
  },

  async logout(): Promise<void> {
    try { await api.post('/auth/logout') } catch {}
    await AsyncStorage.removeItem('access_token')
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('access_token')
  },

  async getProfile(): Promise<LoginResponse['user']> {
    const res = await api.get('/account/profile')
    const raw = res.data.data ?? res.data
    const allowWifi    = raw.allowWifi    ?? raw.allow_wifi
    const noCheckOut   = raw.noCheckOut   ?? raw.no_check_out
    const allowOutside = raw.allowOutside ?? raw.allow_outside
    return {
      ...raw,
      // Only include permission flags when the backend actually provides them.
      // If null/undefined, omit them so the existing Redux value is preserved.
      ...(allowWifi    != null && { allowWifi }),
      ...(noCheckOut   != null && { noCheckOut }),
      ...(allowOutside != null && { allowOutside }),
    }
  },

  async getMyShift() {
    const res = await api.get('/account/my-shift')
    return res.data
  },

  async registerFcmToken(fcmToken: string): Promise<void> {
    try {
      await api.put('/account/fcm-token', { fcm_token: fcmToken })
      console.log('[FCM] token registered')
    } catch (e: any) {
      console.log('[FCM] registerFcmToken failed:', e?.response?.status, e?.response?.data)
    }
  },
}
