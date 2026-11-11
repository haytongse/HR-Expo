import { useState, useEffect } from 'react'
import Geolocation from '@react-native-community/geolocation'
import { Platform, PermissionsAndroid } from 'react-native'

export interface AddressDetail {
  street: string | null
  village: string | null
  sangkat: string | null
  district: string | null
  city: string | null
  country: string | null
  formatted: string | null
}

export interface LocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  address: AddressDetail
  error: string | null
  isLoading: boolean
}

const EMPTY_ADDRESS: AddressDetail = { street: null, village: null, sangkat: null, district: null, city: null, country: null, formatted: null }

async function reverseGeocode(lat: number, lon: number): Promise<AddressDetail> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'HRApp/1.0' } }
    )
    const data = await res.json()
    const a = data.address || {}
    const street = [a.road, a.house_number].filter(Boolean).join(' ') || null
    const village = a.village || a.neighbourhood || a.town || null
    const sangkat = a.suburb || a.quarter || null
    const district = a.city_district || a.county || a.state_district || null
    const city = a.city || a.municipality || a.state || null
    const country = a.country || null
    const parts = [street, village, sangkat, district, city, country].filter(Boolean)
    return { street, village, sangkat, district, city, country, formatted: parts.join(', ') || null }
  } catch {
    return EMPTY_ADDRESS
  }
}

export const useLocationViewModel = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null, longitude: null, accuracy: null, address: EMPTY_ADDRESS, error: null, isLoading: false,
  })

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        { title: 'Location Access', message: 'This app needs your location for check-in', buttonPositive: 'OK' }
      )
      return granted === PermissionsAndroid.RESULTS.GRANTED
    }
    return true
  }

  const getCurrentLocation = () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }))
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords
        const address = await reverseGeocode(latitude, longitude)
        setLocation({ latitude, longitude, accuracy: accuracy ?? null, address, error: null, isLoading: false })
      },
      (err) => setLocation(prev => ({ ...prev, error: err.message, isLoading: false })),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }
    )
  }

  useEffect(() => {
    requestPermission().then(ok => { if (ok) getCurrentLocation() })
  }, [])

  return { location, getCurrentLocation }
}
