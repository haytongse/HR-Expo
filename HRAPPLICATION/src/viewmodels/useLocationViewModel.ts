import { useState, useEffect } from 'react'
import * as Location from 'expo-location'

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

  const getCurrentLocation = async () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }))
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocation(prev => ({ ...prev, error: 'Location permission denied', isLoading: false }))
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      const { latitude, longitude, accuracy } = pos.coords
      const address = await reverseGeocode(latitude, longitude)
      setLocation({ latitude, longitude, accuracy: accuracy ?? null, address, error: null, isLoading: false })
    } catch (err: any) {
      setLocation(prev => ({ ...prev, error: err.message, isLoading: false }))
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return { location, getCurrentLocation }
}
