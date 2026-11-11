import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { navigate } from '../navigation/navigationRef'

// export const SERVER_URL = 'http://220.158.233.141:3336'
export const SERVER_URL = 'http://192.168.1.21:3336'
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
      await AsyncStorage.multiRemove(['access_token', 'refresh_token'])
      navigate('Login')
    }
    return Promise.reject(error)
  }
)

export default api
