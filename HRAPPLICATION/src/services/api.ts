import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { navigate } from '../navigation/navigationRef'

// export const SERVER_URL = 'http://192.168.1.21:3336'
export const SERVER_URL = 'http://162.243.238.38:3336'
const BASE_URL = `${SERVER_URL}/api/v1`
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const isAuthEndpoint = config.url?.startsWith('/auth/')
  if (!isAuthEndpoint) {
    const token = await AsyncStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      try {
        await AsyncStorage.removeItem('access_token')
        await AsyncStorage.removeItem('refresh_token')
        navigate('Login')
      } catch {}
    }
    return Promise.reject(error)
  }
)

export default api
