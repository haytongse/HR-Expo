import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, StatusBar, Animated, Platform, useWindowDimensions, Easing,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useSelector, useDispatch } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView } from 'expo-camera'
import * as ExpoLocation from 'expo-location'
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo'
import { useAttendanceViewModel } from '../viewmodels/useAttendanceViewModel'
import { useLocationViewModel } from '../viewmodels/useLocationViewModel'
import { attendanceService } from '../services/attendanceService'
import { authService } from '../services/authService'
import { Campus } from '../models'
import { Toast } from '../components/Toast'
import { AppAlert, useAlert } from '../components/AppAlert'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import type { RootState } from '../store'
import { updateUser } from '../store/authSlice'
import { useLanguage } from '../i18n/LanguageContext'

async function requestCameraPermission(): Promise<boolean> {
  const { Camera } = await import('expo-camera')
  const { status } = await Camera.requestCameraPermissionsAsync()
  return status === 'granted'
}

async function requestLocationPermission(): Promise<void> {
  await ExpoLocation.requestForegroundPermissionsAsync()
}

function extractSsid(state: any): string | null {
  if (state.type !== NetInfoStateType.wifi) return null
  const raw = state.details?.ssid ?? state.details?.SSID ?? null
  if (typeof raw !== 'string') return null
  if (raw.includes('<unknown')) return null
  // Some Android versions wrap the SSID in double quotes — strip them
  const ssid = raw.trim().replace(/^"|"$/g, '').trim()
  return ssid || null
}

function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

function extractCodeFromQR(value: string, campuses: Campus[]): Campus | null {
  const trimmed = value.trim()
  let match = campuses.find(c => c.publicId && c.publicId === trimmed)
  if (match) return match
  match = campuses.find(c => c.publicId && c.publicId.toLowerCase() === trimmed.toLowerCase())
  if (match) return match
  match = campuses.find(c => c.code === trimmed)
  if (match) return match
  match = campuses.find(c => c.code.toLowerCase() === trimmed.toLowerCase())
  if (match) return match
  try {
    const url = new URL(trimmed)
    const codeParam = url.searchParams.get('public_id') || url.searchParams.get('code') || url.searchParams.get('campus_code') || url.searchParams.get('campus')
    if (codeParam) {
      match = campuses.find(c => (c.publicId && c.publicId.toLowerCase() === codeParam.toLowerCase()) || c.code.toLowerCase() === codeParam.toLowerCase())
      if (match) return match
    }
    const segment = url.pathname.split('/').filter(Boolean).pop() ?? ''
    if (segment) {
      match = campuses.find(c => (c.publicId && c.publicId.toLowerCase() === segment.toLowerCase()) || c.code.toLowerCase() === segment.toLowerCase())
      if (match) return match
    }
  } catch {}
  try {
    const json = JSON.parse(trimmed)
    const idVal = json.public_id || json.publicId
    if (idVal) {
      match = campuses.find(c => c.publicId && c.publicId.toLowerCase() === String(idVal).toLowerCase())
      if (match) return match
    }
    const codeVal = json.code || json.campus_code || json.campusCode
    if (codeVal) {
      match = campuses.find(c => c.code.toLowerCase() === String(codeVal).toLowerCase())
      if (match) return match
    }
  } catch {}
  return null
}

const ALERT_TIMEOUT = 4000

function ScanAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const progress = useRef(new Animated.Value(1)).current
  const { t } = useLanguage()

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 0,
      duration: ALERT_TIMEOUT,
      useNativeDriver: false,
    }).start()
    const timer = setTimeout(onDismiss, ALERT_TIMEOUT)
    return () => clearTimeout(timer)
  }, [onDismiss, progress])

  const isWifi = message.toLowerCase().includes('wifi')
  const isLocation = message.includes('campus area')
  const isNotInCampus = isWifi || isLocation
  const icon: string = isNotInCampus ? 'map-marker-alt' : 'exclamation-triangle'

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={alertStyles.overlay}>
        <View style={alertStyles.card}>
          <View style={alertStyles.iconBox}>
            <FontAwesome5 iconStyle="solid" name={icon as any} size={32} color="#EF4444" />
          </View>
          <Text style={alertStyles.title}>
            {isNotInCampus
              ? t('scan_alert_not_in_campus')
              : message.includes('recognized')
              ? t('scan_alert_invalid_qr')
              : t('scan_alert_cannot')}
          </Text>
          <Text style={alertStyles.body}>{message}</Text>
          <Animated.View
            style={[alertStyles.progressBar, {
              width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            }]}
          />
          <TouchableOpacity style={alertStyles.btn} onPress={onDismiss} activeOpacity={0.8}>
            <Text style={alertStyles.btnTxt}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default function ScanScreen() {
  const { width: screenW } = useWindowDimensions()
  const frameSize = screenW * 0.62
  const navigation = useNavigation<any>()
  const { t } = useLanguage()
  const [scanning, setScanning] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const scanLineAnim = useRef(new Animated.Value(0)).current
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [campusesError, setCampusesError] = useState(false)
  const [cameraPermitted, setCameraPermitted] = useState(true)
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const [myShift, setMyShift] = useState<{
    shift: { id: number; name: string | null; startDate: string; endDate: string; allowTimeBefore: number | null; allowTimeAfter: number | null; allowAmountScan: number | null } | null
    timetables: { id: number; label: string; startTime: string | null; endTime: string | null; dayOfWeek: number }[]
  } | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [wifiSsid, setWifiSsid] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkInError, setCheckInError] = useState<string | null>(null)

  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()

  const currentUser = useSelector((state: RootState) => state.auth.user)
  const dispatch = useDispatch()
  const tabBarHeight = useBottomTabBarHeight()

  const { checkIn, isLoading, todayCheckIns, loadTodayCheckIns } = useAttendanceViewModel()
  const { location } = useLocationViewModel()
  const insets = useSafeAreaInsets()

  const loadCampuses = () => {
    setCampusesError(false)
    attendanceService.getCampuses()
      .then(list => setCampuses(list))
      .catch(() => setCampusesError(true))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTodayCheckIns()
    loadCampuses()
    authService.getMyShift().then(setMyShift).catch(() => {})
    authService.getProfile().then(profile => dispatch(updateUser(profile))).catch(() => {})
    requestCameraPermission().then(granted => setCameraPermitted(granted))
    const clockTick = setInterval(() => setNow(new Date()), 60_000)

    NetInfo.configure({ shouldFetchWiFiSSID: true })

    const unsubscribe = NetInfo.addEventListener(state => {
      setWifiSsid(extractSsid(state))
    })

    requestLocationPermission().then(() => {
      NetInfo.refresh().then(state => setWifiSsid(extractSsid(state)))
    })

    return () => { unsubscribe(); clearInterval(clockTick) }
  }, [])

  useEffect(() => {
    return navigation.addListener('focus', () => {
      loadTodayCheckIns()
      loadCampuses()
      authService.getMyShift().then(setMyShift).catch(() => {})
      authService.getProfile().then(profile => dispatch(updateUser(profile))).catch(() => {})
    })
  }, [navigation])

  useEffect(() => {
    return navigation.addListener('tabLongPress', () => {
      loadTodayCheckIns()
      loadCampuses()
      authService.getMyShift().then(setMyShift).catch(() => {})
    })
  }, [navigation])

  useEffect(() => {
    return navigation.addListener('blur', () => {
      setScanning(false)
      setTorchOn(false)
      setSelectedCampus(null)
      setAlertMsg(null)
    })
  }, [navigation])

  useEffect(() => {
    if (!scanning) {
      scanLineAnim.stopAnimation()
      return
    }

    // Scan line animation
    const lineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    )
    lineLoop.start()

    return () => { lineLoop.stop() }
  }, [scanning, scanLineAnim])

  const getCheckType = (): 'check_in' | 'check_out' => {
    if (currentUser?.noCheckOut) return 'check_in'
    if (todayCheckIns.length === 0) return 'check_in'
    const last = todayCheckIns[todayCheckIns.length - 1]
    return last.scanType === 'check_in' ? 'check_out' : 'check_in'
  }

  const dismissAlert = useCallback(() => setAlertMsg(null), [])

  const handleScan = (code: string) => {
    if (alertMsg) return
    if (campuses.length === 0) {
      setAlertMsg('Campus data not loaded.\nClose the scanner and tap Retry.')
      return
    }
    const campus = extractCodeFromQR(code, campuses)
    if (!campus) {
      setAlertMsg('QR code not recognized.\nThis QR does not match any campus.')
      return
    }
    if (currentUser?.role !== 'admin' && currentUser?.campusId && Number(campus.id) !== Number(currentUser.campusId)) {
      setAlertMsg(`You are not assigned to this campus.\nYour campus does not match the scanned QR code.`)
      return
    }
    if (campus.wifis && campus.wifis.length > 0 && !currentUser?.allowWifi && !currentUser?.allowOutside && !currentUser?.noCheckOut) {
      const matched = wifiSsid && campus.wifis.some(
        w => w.wifiName.trim().toLowerCase() === wifiSsid.trim().toLowerCase()
      )

      if (!matched) {
        const names = campus.wifis.map(w => w.wifiName.trim()).join(', ')
        setAlertMsg(`You are not connected to the campus WiFi.\nAllowed networks: ${names}`)
        return
      }
    }
    if (!currentUser?.allowOutside && campus.lat != null && campus.long != null && campus.allowMeter) {
      if (!location.latitude || !location.longitude) {
        setAlertMsg('Location not available yet.\nPlease wait a moment and try again.')
        return
      }
      const allowMeter = Number(campus.allowMeter)
      const dist = distanceMeters(location.latitude, location.longitude, Number(campus.lat), Number(campus.long))
      if (dist > allowMeter) {
        const name = currentUser?.fullName ?? 'You'
        setAlertMsg(`${name} is not in the campus area.\n${formatDistance(dist)} away from ${campus.fullName}`)
        return
      }
    }
    setScanning(false)
    setTorchOn(false)
    setSelectedCampus(campus)
    setCheckInError(null)
  }

  const doCheckIn = async () => {
    if (!selectedCampus || !location.latitude || !location.longitude) return
    setSubmitting(true)
    setCheckInError(null)
    try {
      const type = swStatus.kind === 'open' ? swStatus.scanType : getCheckType()
      await checkIn({
        campus_code: selectedCampus.code,
        latitude: location.latitude,
        longitude: location.longitude,
        scan_type: type,
        address: location.address.formatted,
        street: location.address.street,
        village: location.address.village,
        sangkat: location.address.sangkat,
        district: location.address.district,
        city: location.address.city,
        country: location.address.country,
      })
      setSelectedCampus(null)
      setCheckInError(null)
      Toast.success(type === 'check_in' ? t('checked_in_success') : t('checked_out_success'))
      loadTodayCheckIns()
      navigation.navigate('Home')
    } catch (err: any) {
      setCheckInError(err?.response?.data?.message || err.message || 'Check-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCheckIn = () => {
    if (submitting) return
    if (!selectedCampus) { Toast.warning('Please scan or select a campus first'); return }
    if (!location.latitude || !location.longitude) { Toast.warning('Location not available. Tap refresh.'); return }
    if (selectedCampus.wifis && selectedCampus.wifis.length > 0 && !currentUser?.allowWifi && !currentUser?.allowOutside && !currentUser?.noCheckOut) {
      const matched = wifiSsid && selectedCampus.wifis.some(
        w => w.wifiName.trim().toLowerCase() === wifiSsid.trim().toLowerCase()
      )
      if (!matched) {
        const names = selectedCampus.wifis.map(w => `"${w.wifiName.trim()}"`).join(', ')
        Toast.error(`Connect to campus WiFi to check in. Allowed: ${names}`)
        return
      }
    }
    const type = swStatus.kind === 'open' ? swStatus.scanType : getCheckType()
    const isIn = type === 'check_in'
    showConfirm({
      title: isIn ? t('confirm_check_in') : t('confirm_check_out'),
      message: `${isIn ? t('check_in') : t('check_out')} ${t('confirm_at')} ${selectedCampus.fullName}?`,
      icon: isIn ? 'sign-in-alt' : 'sign-out-alt',
      iconColor: isIn ? '#10B981' : '#EF4444',
      iconBg: isIn ? '#D1FAE5' : '#FEE2E2',
      buttons: [
        { text: t('btn_cancel'), style: 'cancel' },
        { text: isIn ? t('btn_check_in') : t('btn_check_out'), onPress: doCheckIn },
      ],
    })
  }

  const distance = location.latitude != null && location.longitude != null && selectedCampus?.lat != null && selectedCampus?.long != null
    ? distanceMeters(location.latitude, location.longitude, Number(selectedCampus.lat), Number(selectedCampus.long))
    : null

  const inCampus = distance !== null && selectedCampus?.allowMeter != null
    ? distance <= Number(selectedCampus.allowMeter)
    : null

  const checkType = getCheckType()
  const isCheckIn = checkType === 'check_in'

  const fmtMin = (totalMin: number) => {
    const h = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60)
    const m = ((totalMin % 1440) + 1440) % 1440 % 60
    const ampm = h < 12 ? 'AM' : 'PM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
  }
  const timeToMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const nowMin = now.getHours() * 60 + now.getMinutes()

  type ScanWindowStatus =
    | { kind: 'no_shift' }
    | { kind: 'no_schedule' }
    | { kind: 'exempt' }
    | { kind: 'done'; total: number; nextAt: string | null }
    | { kind: 'too_early'; opensAt: string }
    | { kind: 'open'; label: string; closesAt: string; scanType: 'check_in' | 'check_out' }
    | { kind: 'missed'; total: number; endAt: string | null }

  const scanWindowStatus = (): ScanWindowStatus => {
    if (!myShift) return { kind: 'no_shift' }
    if (!myShift.shift) return { kind: 'no_shift' }
    if (currentUser?.noCheckOut) return { kind: 'exempt' }

    const { allowTimeBefore, allowTimeAfter, allowAmountScan } = myShift.shift
    // Server already pre-filters timetables by today's day-of-week, so use them directly
    const entries = myShift.timetables
    if (entries.length === 0) return { kind: 'no_schedule' }

    const lastEntry = entries[entries.length - 1]
    const lastEndAt = lastEntry?.endTime ? fmtMin(timeToMin(lastEntry.endTime.slice(0, 5))) : null

    const maxScans = Math.max(allowAmountScan ?? 0, entries.length * 2)
    if (todayCheckIns.length >= maxScans) {
      for (const entry of entries) {
        if (!entry.startTime) continue
        const ciTarget  = timeToMin(entry.startTime)
        const coTarget  = entry.endTime ? timeToMin(entry.endTime) : null
        const coLatest  = coTarget !== null ? coTarget + (allowTimeAfter ?? 0) : null
        const spanStart = ciTarget - (allowTimeBefore ?? 0)
        const spanEnd   = coLatest ?? ciTarget + (allowTimeAfter ?? 0)
        const eScans    = todayCheckIns.filter(ci => {
          if (!ci.time) return false
          const m = timeToMin(ci.time.slice(0, 5))
          return m >= spanStart && m <= spanEnd
        })
        const ciCount = eScans.filter(ci => ci.scanType === 'check_in').length
        const coCount = eScans.filter(ci => ci.scanType === 'check_out').length
        const lastEScan = eScans.length > 0 ? eScans[eScans.length - 1] : null
        const hasUnpairedCI = ciCount > coCount || (lastEScan?.scanType === 'check_in' && ciCount > 0)
        if (hasUnpairedCI) {
          const coEarliest = coTarget !== null ? coTarget - (allowTimeBefore ?? 0) : null
          if (coEarliest !== null && coLatest !== null) {
            if (nowMin >= coEarliest && nowMin <= coLatest)
              return { kind: 'open', label: entry.label, closesAt: fmtMin(coLatest), scanType: 'check_out' }
            if (nowMin < coEarliest)
              return { kind: 'too_early', opensAt: fmtMin(coEarliest) }
          }
          return { kind: 'missed', total: todayCheckIns.length, endAt: lastEndAt }
        }
      }
      return { kind: 'done', total: maxScans, nextAt: null }
    }

    for (const entry of entries) {
      if (!entry.startTime) continue
      const ciTarget   = timeToMin(entry.startTime)
      const coTarget   = entry.endTime ? timeToMin(entry.endTime) : null
      const ciEarliest = ciTarget - (allowTimeBefore ?? 0)
      const ciLatest   = ciTarget + (allowTimeAfter  ?? 0)
      const coEarliest = coTarget !== null ? coTarget - (allowTimeBefore ?? 0) : null
      const coLatest   = coTarget !== null ? coTarget + (allowTimeAfter  ?? 0) : null

      const inCiWindow = nowMin >= ciEarliest && nowMin <= ciLatest
      const inCoWindow = coEarliest !== null && coLatest !== null &&
                         nowMin >= coEarliest && nowMin <= coLatest

      if (!inCiWindow && !inCoWindow) continue

      const spanStart = ciEarliest
      const spanEnd   = coLatest ?? ciLatest
      const entryScans = todayCheckIns.filter(ci => {
        if (!ci.time) return false
        const m = timeToMin(ci.time.slice(0, 5))
        return m >= spanStart && m <= spanEnd
      })
      const hasCI = entryScans.some(ci => ci.scanType === 'check_in')
      const hasCO = entryScans.some(ci => ci.scanType === 'check_out')

      if (inCiWindow) {
        if (hasCI) {
          if (currentUser?.noCheckOut) return { kind: 'done', total: todayCheckIns.length, nextAt: null }
          // CI and CO windows can overlap — if checkout window is also open and not yet done, show checkout
          if (inCoWindow && !hasCO) {
            return { kind: 'open', label: entry.label, closesAt: fmtMin(coLatest!), scanType: 'check_out' }
          }
          const nextAt = entry.endTime ? fmtMin(timeToMin(entry.endTime.slice(0, 5))) : null
          return { kind: 'done', total: todayCheckIns.length, nextAt }
        }
        // If the last scan overall is a check_in (unmatched from a previous session),
        // show checkout button so user completes the previous session before checking in again.
        if (!currentUser?.noCheckOut) {
          const lastScan = todayCheckIns.length > 0 ? todayCheckIns[todayCheckIns.length - 1] : null
          if (lastScan?.scanType === 'check_in') {
            // Find the previous entry's end time to show as the checkout time
            const lastScanMin = lastScan.time ? timeToMin(lastScan.time.slice(0, 5)) : null
            let prevCoTime = '--'
            if (lastScanMin !== null) {
              for (const e of entries) {
                const eStart = e.startTime ? timeToMin(e.startTime) - (allowTimeBefore ?? 0) : null
                const eEnd   = e.endTime   ? timeToMin(e.endTime)   + (allowTimeAfter  ?? 0) : null
                if (eStart !== null && eEnd !== null && lastScanMin >= eStart && lastScanMin <= eEnd && e.endTime) {
                  prevCoTime = fmtMin(timeToMin(e.endTime.slice(0, 5)))
                  break
                }
              }
            }
            return { kind: 'open', label: entry.label, closesAt: prevCoTime, scanType: 'check_out' }
          }
        }
        return { kind: 'open', label: entry.label, closesAt: fmtMin(ciLatest), scanType: 'check_in' }
      } else {
        if (currentUser?.noCheckOut) {
          // noCheckOut users don't need to check out — if they've checked in, they're done
          if (hasCI) return { kind: 'done', total: todayCheckIns.length, nextAt: null }
          return { kind: 'missed', total: todayCheckIns.length, endAt: lastEndAt }
        }
        if (hasCO) {
          const idx = entries.indexOf(entry)
          const nextEntry = entries[idx + 1]
          const nextAt = nextEntry?.startTime ? fmtMin(timeToMin(nextEntry.startTime.slice(0, 5))) : null
          return { kind: 'done', total: todayCheckIns.length, nextAt }
        }
        return { kind: 'open', label: entry.label, closesAt: fmtMin(coLatest!), scanType: 'check_out' }
      }
    }

    for (const entry of entries) {
      const spanStart = entry.startTime ? timeToMin(entry.startTime) - (allowTimeBefore ?? 0) : null
      const spanEnd   = entry.endTime   ? timeToMin(entry.endTime)   + (allowTimeAfter  ?? 0) : null
      const entryScans = (spanStart !== null && spanEnd !== null)
        ? todayCheckIns.filter(ci => {
            if (!ci.time) return false
            const m = timeToMin(ci.time.slice(0, 5))
            return m >= spanStart! && m <= spanEnd!
          })
        : []
      const hasCI = entryScans.some(ci => ci.scanType === 'check_in')
      // For hasCO in fallback: also catch late checkouts past spanEnd
      const hasCO = todayCheckIns.some(ci => {
        if (!ci.time || ci.scanType !== 'check_out') return false
        const m = timeToMin(ci.time.slice(0, 5))
        return spanStart !== null && m >= spanStart
      })
      const ciEarliest = entry.startTime ? timeToMin(entry.startTime) - (allowTimeBefore ?? 0) : null
      const coEarliest = entry.endTime   ? timeToMin(entry.endTime)   - (allowTimeBefore ?? 0) : null
      const coLatestFb = entry.endTime   ? timeToMin(entry.endTime)   + (allowTimeAfter  ?? 0) : null
      if (!hasCI && ciEarliest !== null && ciEarliest > nowMin) return { kind: 'too_early', opensAt: fmtMin(ciEarliest) }
      if (!currentUser?.noCheckOut && hasCI && !hasCO && coEarliest !== null && coEarliest > nowMin) return { kind: 'too_early', opensAt: fmtMin(coEarliest) }
      // Checkout window passed — still allow late checkout (with or without prior check-in)
      if (!currentUser?.noCheckOut && !hasCO) {
        return { kind: 'open', label: entry.label, closesAt: coLatestFb !== null ? fmtMin(coLatestFb) : '--', scanType: 'check_out' }
      }
    }
    return { kind: 'missed', total: todayCheckIns.length, endAt: lastEndAt }
  }

  const swStatus = scanWindowStatus()
  // Time-based: use open window's scanType for header chip; fall back to last-scan type
  const headerIsCheckIn = swStatus.kind === 'open' ? swStatus.scanType === 'check_in' : isCheckIn

  // ── Full-screen QR Scanner ──────────────────────────────────────────────
  if (scanning) {
    const scanLineTY = scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, frameSize - 4],
    })

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={(e) => handleScan(e.data)}
        />

        {/* Dark overlay with cutout */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={[styles.overlayMiddle, { height: frameSize }]}>
            <View style={styles.overlaySide} />
            {/* QR crop frame */}
            <View style={[styles.scanFrame, { width: frameSize, height: frameSize }]}>
              <View style={[styles.fc, styles.fcTL]} />
              <View style={[styles.fc, styles.fcTR]} />
              <View style={[styles.fc, styles.fcBL]} />
              <View style={[styles.fc, styles.fcBR]} />
              {/* Animated scan line */}
              <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineTY }] }]} />
            </View>
            {alertMsg && <ScanAlert message={alertMsg} onDismiss={dismissAlert} />}
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.scanLabel}>
              {isCheckIn ? t('scan_to_check_in') : t('scan_to_check_out')}
            </Text>
            {swStatus.kind === 'open' && (
              <Text style={[styles.scanLabel, { fontSize: 12, fontWeight: '500', opacity: 0.7 }]}>
                {swStatus.closesAt && swStatus.closesAt !== '--' ? `${t('window_closes_at')} ${swStatus.closesAt}` : ''}
              </Text>
            )}

            <View style={styles.scanControls}>
              <TouchableOpacity
                style={[styles.scanControlBtn, styles.scanControlCenter]}
                onPress={() => { setScanning(false); setTorchOn(false) }}
              >
                <FontAwesome5 iconStyle="solid" name="times" size={26} color="#fff" />
                <Text style={styles.scanControlTxt}>{t('scan_close')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scanControlBtn, torchOn && styles.torchActive]}
                onPress={() => setTorchOn(v => !v)}
              >
                <FontAwesome5 iconStyle="solid" name={torchOn ? 'bolt' : 'bolt'} size={22} color={torchOn ? '#FBBF24' : '#fff'} />
                <Text style={[styles.scanControlTxt, torchOn && { color: '#FBBF24' }]}>{t('scan_flash')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    )
  }

  // ── Main Screen ────────────────────────────────────────────────────────
  const wifiOk = currentUser?.allowWifi || currentUser?.allowOutside || currentUser?.noCheckOut || (
    selectedCampus?.wifis && selectedCampus.wifis.length > 0
      ? !!(wifiSsid && selectedCampus.wifis.some(w => w.wifiName.trim().toLowerCase() === wifiSsid.trim().toLowerCase()))
      : true
  )

  const openScanner = () => {
    if (!cameraPermitted) { Toast.warning('Camera permission is required to scan'); return }
    setScanning(true)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={[styles.topStrip, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <FontAwesome5 iconStyle="solid"
              name={wifiSsid ? 'wifi' : 'wifi'}
              size={13}
              color={wifiSsid ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)'}
            />
            <Text style={[styles.topWifiTxt, !wifiSsid && styles.topWifiTxtOff]}>
              {wifiSsid ?? t('no_wifi')}
            </Text>
          </View>
          <View style={[styles.typeChip, { backgroundColor: headerIsCheckIn ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
            <FontAwesome5 iconStyle="solid" name={headerIsCheckIn ? 'sign-in-alt' : 'sign-out-alt'} size={13} color={headerIsCheckIn ? '#10B981' : '#EF4444'} />
            <Text style={[styles.typeChipTxt, { color: headerIsCheckIn ? '#10B981' : '#EF4444' }]}>
              {headerIsCheckIn ? t('check_in') : t('check_out')}
            </Text>
          </View>
        </View>
        {todayCheckIns.length > 0 && (
          <Text style={styles.scanCountTxt}>{todayCheckIns.length} {t('scan_count_today')}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.scanArea} onPress={openScanner} activeOpacity={0.9}>
        <View style={styles.frameWrap}>
          <View style={[styles.fc, styles.fcTL, styles.fcLight]} />
          <View style={[styles.fc, styles.fcTR, styles.fcLight]} />
          <View style={[styles.fc, styles.fcBL, styles.fcLight]} />
          <View style={[styles.fc, styles.fcBR, styles.fcLight]} />
          <FontAwesome5 iconStyle="solid" name="qrcode" size={72} color="rgba(255,255,255,0.2)" />
        </View>
        <Text style={styles.tapLabel}>{t('tap_to_scan')}</Text>
        <Text style={styles.tapSub}>{headerIsCheckIn ? t('point_check_in') : t('point_check_out')}</Text>

        {!cameraPermitted && (
          <View style={styles.permWarn}>
            <FontAwesome5 iconStyle="solid" name="camera" size={14} color="#EF4444" />
            <Text style={styles.permWarnTxt}>{t('camera_permission')}</Text>
          </View>
        )}
        {campusesError && (
          <TouchableOpacity style={styles.permWarn} onPress={e => { e.stopPropagation?.(); loadCampuses() }}>
            <FontAwesome5 iconStyle="solid" name="sync" size={14} color="#F59E0B" />
            <Text style={[styles.permWarnTxt, { color: '#F59E0B' }]}>{t('campuses_error')}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <View style={[styles.bottomPanel, { paddingBottom: tabBarHeight + 120 }]}>
        {selectedCampus ? (
          <>
            <View style={styles.campusRow}>
              <View style={[styles.campusRowIcon, { backgroundColor: isCheckIn ? '#D1FAE5' : '#FEE2E2' }]}>
                <FontAwesome5 iconStyle="solid" name="building" size={18} color={isCheckIn ? '#10B981' : '#EF4444'} />
              </View>
              <View style={styles.campusRowText}>
                <Text style={styles.campusRowName}>{selectedCampus.fullName}</Text>
                <View style={styles.campusRowMeta}>
                  <Text style={styles.campusRowCode}>{selectedCampus.code}</Text>
                  {selectedCampus.wifis && selectedCampus.wifis.length > 0 && (
                    <View style={[styles.wifiStatusChip, wifiOk ? styles.wifiStatusChipOk : styles.wifiStatusChipFail]}>
                      <FontAwesome5 iconStyle="solid" name={wifiOk ? 'wifi' : 'wifi'} size={10} color={wifiOk ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.wifiStatusChipTxt, { color: wifiOk ? '#10B981' : '#EF4444' }]}>
                        {wifiOk ? t('campus_wifi_ok') : t('campus_wifi_wrong')}
                      </Text>
                    </View>
                  )}
                  {inCampus !== null && (
                    <View style={[styles.wifiStatusChip, inCampus ? styles.wifiStatusChipOk : styles.wifiStatusChipFail]}>
                      <FontAwesome5 iconStyle="solid" name={inCampus ? 'map-marker-alt' : 'map-marker-alt'} size={10} color={inCampus ? '#10B981' : '#EF4444'} />
                      <Text style={[styles.wifiStatusChipTxt, { color: inCampus ? '#10B981' : '#EF4444' }]}>
                        {inCampus ? t('campus_in') : t('campus_out')}
                        {distance !== null ? ` · ${formatDistance(distance)}` : ''}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedCampus(null)} style={styles.campusRowClear}>
                <FontAwesome5 iconStyle="solid" name="times" size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {location.latitude ? (
              <View style={styles.locationRow}>
                <FontAwesome5 iconStyle="solid" name="location-arrow" size={13} color="#6366F1" style={{ marginTop: 2 }} />
                <View style={{ flex: 1, gap: 2 }}>
                  {location.address.street ? (
                    <Text style={styles.locationTxt} numberOfLines={1}>
                      <Text style={{ color: '#94A3B8' }}>Street: </Text>{location.address.street}
                    </Text>
                  ) : null}
                  {location.address.village ? (
                    <Text style={styles.locationTxt} numberOfLines={1}>
                      <Text style={{ color: '#94A3B8' }}>Village: </Text>{location.address.village}
                    </Text>
                  ) : null}
                  {location.address.sangkat ? (
                    <Text style={styles.locationTxt} numberOfLines={1}>
                      <Text style={{ color: '#94A3B8' }}>Sangkat: </Text>{location.address.sangkat}
                    </Text>
                  ) : null}
                  {!location.address.street && !location.address.village && !location.address.sangkat && (
                    <Text style={styles.locationTxt} numberOfLines={2}>
                      {location.address.formatted ?? `${location.latitude.toFixed(5)}, ${location.longitude?.toFixed(5)}`}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.locationRow}>
                <FontAwesome5 iconStyle="solid" name="location-arrow" size={13} color="#94A3B8" />
                <Text style={[styles.locationTxt, { color: '#94A3B8' }]}>{t('fetching_location')}</Text>
              </View>
            )}

            {swStatus.kind === 'exempt' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(99,102,241,0.10)' }]}>
                <FontAwesome5 iconStyle="solid" name="check-double" size={13} color="#818CF8" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#A5B4FC' }]}>{t('shift_exempt')}</Text>
                  <Text style={[styles.shiftTime, { color: 'rgba(165,180,252,0.7)' }]}>{t('shift_exempt_sub')}</Text>
                </View>
              </View>
            )}
            {swStatus.kind === 'no_shift' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
                <FontAwesome5 iconStyle="solid" name="exclamation-circle" size={13} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#FCA5A5' }]}>{t('shift_no_shift')}</Text>
                  <Text style={[styles.shiftTime, { color: 'rgba(252,165,165,0.7)' }]}>{t('shift_no_shift_sub')}</Text>
                </View>
              </View>
            )}
            {swStatus.kind === 'no_schedule' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
                <FontAwesome5 iconStyle="solid" name="calendar-alt" size={13} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#FCA5A5' }]}>{t('shift_no_schedule')}</Text>
                  <Text style={[styles.shiftTime, { color: 'rgba(252,165,165,0.7)' }]}>{t('shift_no_schedule_sub')}</Text>
                </View>
              </View>
            )}
            {swStatus.kind === 'done' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(16,185,129,0.10)' }]}>
                <FontAwesome5 iconStyle="solid" name="check-circle" size={13} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#6EE7B7' }]}>{t('shift_done_all')} {swStatus.total} {t('shift_done_scans')}</Text>
                  {swStatus.nextAt && (
                    <Text style={[styles.shiftTime, { color: 'rgba(110,231,183,0.7)' }]}>{t('shift_next_scan_at')} {swStatus.nextAt}</Text>
                  )}
                </View>
              </View>
            )}
            {swStatus.kind === 'too_early' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(245,158,11,0.08)' }]}>
                <FontAwesome5 iconStyle="solid" name="clock" size={13} color="#F59E0B" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#FDE68A' }]}>{myShift?.shift?.name ?? 'Shift'}</Text>
                  <Text style={[styles.shiftTime, { color: 'rgba(253,230,138,0.7)' }]}>
                    {swStatus.kind === 'too_early' ? `${getCheckType() === 'check_in' ? 'Check in' : 'Check out'} opens at ${swStatus.opensAt}` : ''}
                  </Text>
                </View>
              </View>
            )}
            {swStatus.kind === 'open' && swStatus.scanType === 'check_out' && (() => {
              const isLate = swStatus.closesAt !== '--'
              return (
                <View style={[styles.shiftRow, { backgroundColor: 'rgba(245,158,11,0.10)' }]}>
                  <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={13} color="#F59E0B" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.shiftName, { color: '#FDE68A' }]}>Check out required</Text>
                    <Text style={[styles.shiftTime, { color: 'rgba(253,230,138,0.7)' }]}>
                      {isLate
                        ? `Please check out · window closes at ${swStatus.closesAt}`
                        : 'Please check out to continue'}
                    </Text>
                  </View>
                </View>
              )
            })()}
            {swStatus.kind === 'open' && swStatus.scanType === 'check_in' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(16,185,129,0.10)' }]}>
                <FontAwesome5 iconStyle="solid" name="layer-group" size={13} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#6EE7B7' }]}>
                    {myShift?.shift?.name ?? 'Shift'}{swStatus.label ? `  ·  ${swStatus.label}` : ''}
                  </Text>
                  {swStatus.closesAt && swStatus.closesAt !== '--' && (
                    <Text style={[styles.shiftTime, { color: 'rgba(110,231,183,0.7)' }]}>Check in window closes at {swStatus.closesAt}</Text>
                  )}
                </View>
              </View>
            )}
            {swStatus.kind === 'missed' && (
              <View style={[styles.shiftRow, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
                <FontAwesome5 iconStyle="solid" name="times-circle" size={13} color="#EF4444" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shiftName, { color: '#FCA5A5' }]}>
                    {swStatus.total === 0 ? 'Check-in window missed' : 'Scan window missed'}
                  </Text>
                  <Text style={[styles.shiftTime, { color: 'rgba(252,165,165,0.7)' }]}>
                    {swStatus.total === 0
                      ? 'You did not check in · Please contact your administrator to record attendance manually'
                      : `${swStatus.total} scan(s) recorded · window closed${swStatus.endAt ? ` at ${swStatus.endAt}` : ''}`}
                  </Text>
                </View>
              </View>
            )}

{myShift?.timetables && myShift.timetables.length > 0 && (
              <View style={styles.timetableBox}>
                <Text style={styles.timetableTitle}>Today's Schedule</Text>
                {myShift.timetables.map((entry, idx) => {
                  const ciMin = entry.startTime ? timeToMin(entry.startTime.slice(0, 5)) : null
                  const coMin = entry.endTime   ? timeToMin(entry.endTime.slice(0, 5))   : null
                  const spanStart = ciMin !== null ? ciMin - (myShift.shift?.allowTimeBefore ?? 0) : null
                  const spanEnd   = coMin !== null ? coMin + (myShift.shift?.allowTimeAfter ?? 0) : (ciMin !== null ? ciMin + (myShift.shift?.allowTimeAfter ?? 0) : null)
                  const isActive  = spanStart !== null && spanEnd !== null && nowMin >= spanStart && nowMin <= spanEnd
                  const entryScans = spanStart !== null && spanEnd !== null
                    ? todayCheckIns.filter(ci => {
                        if (!ci.time) return false
                        const m = timeToMin(ci.time.slice(0, 5))
                        return m >= spanStart! && m <= spanEnd!
                      })
                    : []
                  const doneCI = entryScans.some(ci => ci.scanType === 'check_in')
                  const doneCO = entryScans.some(ci => ci.scanType === 'check_out')
                  const allowBefore = myShift.shift?.allowTimeBefore ?? 0
                  const ciOpenMin = ciMin !== null ? ciMin - allowBefore : null
                  const coOpenMin = coMin !== null ? coMin - allowBefore : null
                  const nextScanLabel = !doneCI
                    ? `Check in at ${ciOpenMin !== null ? fmtMin(ciOpenMin) : '--'}`
                    : !doneCO ? `Check out at ${coOpenMin !== null ? fmtMin(coOpenMin) : '--'}` : null
                  return (
                    <View key={idx} style={[styles.timetableRow, isActive && styles.timetableRowActive]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timetableLabel}>{entry.label || `Session ${idx + 1}`}</Text>
                        <Text style={styles.timetableTimes}>
                          {entry.startTime ? fmtMin(timeToMin(entry.startTime.slice(0, 5))) : '--'} – {entry.endTime ? fmtMin(timeToMin(entry.endTime.slice(0, 5))) : '--'}
                        </Text>
                        {nextScanLabel ? (
                          <Text style={styles.timetableNext}>⏰ {nextScanLabel}</Text>
                        ) : (
                          <Text style={styles.timetableNextDone}>✓ Completed</Text>
                        )}
                      </View>
                      <View style={styles.timetableBadges}>
                        <View style={[styles.timetableBadge, doneCI && styles.timetableBadgeDone]}>
                          <Text style={[styles.timetableBadgeTxt, doneCI && styles.timetableBadgeTxtDone]}>IN</Text>
                        </View>
                        <View style={[styles.timetableBadge, doneCO && styles.timetableBadgeDone]}>
                          <Text style={[styles.timetableBadgeTxt, doneCO && styles.timetableBadgeTxtDone]}>OUT</Text>
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            )}

            {!alertMsg && !currentUser?.allowOutside && selectedCampus?.allowMeter && selectedCampus?.lat != null && selectedCampus?.long != null && (inCampus === false || inCampus === null) ? (
              <View style={styles.blockMsg}>
                <FontAwesome5 iconStyle="solid" name="map-marker-alt" size={18} color="#EF4444" />
                <Text style={styles.blockMsgTxt}>
                  {inCampus === null
                    ? 'Waiting for location…\nCannot verify you are in the campus area.'
                    : `You are outside the campus area (${distance !== null ? formatDistance(distance) : '—'} away)`}
                </Text>
              </View>
            ) : !alertMsg && !wifiOk ? (
              <View style={styles.blockMsg}>
                <FontAwesome5 iconStyle="solid" name="map-marker-alt" size={18} color="#EF4444" />
                <Text style={styles.blockMsgTxt}>
                  You are not in the campus area.{'\n'}Connect to WiFi:{' '}
                  {selectedCampus.wifis.map(w => `"${w.wifiName.trim()}"`).join(', ')}
                </Text>
              </View>
            ) : swStatus.kind !== 'open' ? null : (
              <>
                <TouchableOpacity
                  style={[styles.checkBtn, swStatus.scanType === 'check_out' && styles.checkBtnOut, (isLoading || submitting) && styles.btnDisabled, { marginBottom: 8 }]}
                  onPress={handleCheckIn}
                  disabled={isLoading || submitting}
                  activeOpacity={0.85}
                >
                  {isLoading || submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <FontAwesome5 iconStyle="solid" name={swStatus.scanType === 'check_in' ? 'sign-in-alt' : 'sign-out-alt'} size={20} color="#fff" />
                      <Text style={styles.checkBtnTxt}>{swStatus.scanType === 'check_in' ? 'Check In Now' : 'Check Out Now'}</Text>
                    </>
                  )}
                </TouchableOpacity>
                {checkInError && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 }}>
                    <FontAwesome5 iconStyle="solid" name="exclamation-circle" size={14} color="#EF4444" />
                    <Text style={{ color: '#FCA5A5', fontSize: 12, flex: 1 }}>{checkInError}</Text>
                  </View>
                )}
              </>
            )}
          </>
        ) : (
          <View style={styles.bottomHint}>
            <FontAwesome5 iconStyle="solid" name="qrcode" size={18} color="rgba(255,255,255,0.4)" />
            <Text style={styles.bottomHintTxt}>No campus selected</Text>
          </View>
        )}
      </View>
      <AppAlert {...confirmProps} />
    </View>
  )
}

const CORNER = 28
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  topStrip: { paddingHorizontal: 20, paddingBottom: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  topWifiTxt: { fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  topWifiTxtOff: { color: 'rgba(255,255,255,0.35)' },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  typeChipTxt: { fontSize: 12, fontWeight: '700' },
  scanCountTxt: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  scanArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  frameWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tapLabel: { fontSize: 22, fontWeight: '800', color: '#fff' },
  tapSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', textAlign: 'center', paddingHorizontal: 40 },
  permWarn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.12)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  permWarnTxt: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  bottomPanel: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', minHeight: 320 },
  bottomHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  bottomHintTxt: { fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  campusRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  campusRowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  campusRowText: { flex: 1 },
  campusRowName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  campusRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  campusRowCode: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  campusRowClear: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  wifiStatusChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  wifiStatusChipOk: { backgroundColor: 'rgba(16,185,129,0.15)' },
  wifiStatusChipFail: { backgroundColor: 'rgba(239,68,68,0.15)' },
  wifiStatusChipTxt: { fontSize: 10, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6 },
  locationTxt: { flex: 1, fontSize: 12, color: '#C7D2FE', lineHeight: 16 },
  shiftRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  shiftName: { fontSize: 12, fontWeight: '700', color: '#FDE68A', lineHeight: 16 },
  shiftTime: { fontSize: 11, color: 'rgba(253,230,138,0.7)', marginTop: 1 },
  timetableBox: { backgroundColor: 'rgba(30,41,59,0.7)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, gap: 6 },
  timetableTitle: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  timetableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.03)' },
  timetableRowActive: { backgroundColor: 'rgba(99,102,241,0.12)', borderWidth: 1, borderColor: 'rgba(99,102,241,0.3)' },
  timetableLabel: { fontSize: 12, fontWeight: '600', color: '#E2E8F0' },
  timetableTimes: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  timetableNext: { fontSize: 10, color: '#F59E0B', marginTop: 3 },
  timetableNextDone: { fontSize: 10, color: '#10B981', marginTop: 3 },
  timetableBadges: { flexDirection: 'row', gap: 5 },
  timetableBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timetableBadgeDone: { backgroundColor: '#10B981', borderColor: '#10B981' },
  timetableBadgeTxt: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  timetableBadgeTxtDone: { color: '#fff' },
  shiftAllowRow: { flexDirection: 'row', gap: 6, marginTop: 5 },
  shiftAllowChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  shiftAllowTxt: { fontSize: 10, fontWeight: '600', color: '#FDE68A' },
  blockMsg: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  blockMsgTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: '#EF4444', lineHeight: 18 },
  checkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  checkBtnOut: { backgroundColor: '#EF4444', shadowColor: '#EF4444' },
  btnDisabled: { opacity: 0.6 },
  checkBtnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
  overlay: { ...StyleSheet.absoluteFill, flexDirection: 'column' },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  overlayMiddle: { flexDirection: 'row' },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },
  scanFrame: { position: 'relative', overflow: 'hidden' },
  overlayBottom: { flex: 1.4, backgroundColor: 'rgba(0,0,0,0.62)', alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 30 },
  scanLabel: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  scanControls: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  scanControlBtn: { alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  scanControlCenter: { paddingHorizontal: 18, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.18)' },
  torchActive: { backgroundColor: 'rgba(251,191,36,0.2)' },
  scanControlTxt: { fontSize: 11, fontWeight: '600', color: '#fff' },
  scanLine: { position: 'absolute', left: 6, right: 6, height: 2, borderRadius: 1, backgroundColor: 'rgba(99,102,241,0.85)', shadowColor: '#6366F1', shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 }, elevation: 4 },
  fc: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#fff', borderWidth: 3.5 },
  fcTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  fcTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  fcBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  fcBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  fcDark: { borderColor: '#6366F1' },
  pickerModal: { flex: 1, backgroundColor: '#F8FAFC' },
  pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  pickerClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  pickerEmpty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  pickerEmptyTxt: { fontSize: 15, color: '#94A3B8' },
  pickerItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#F1F5F9' },
  pickerItemSelected: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  pickerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  pickerItemName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  pickerItemCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  fcLight: { borderColor: 'rgba(255,255,255,0.6)' },
  addrRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addrLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  addrVal:   { flex: 1, fontSize: 12, color: '#64748B' },
})

const alertStyles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  card:     { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  iconBox:  { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  title:    { fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  body:     { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 },
  progressBar: { height: 4, backgroundColor: '#EF4444', borderRadius: 2, alignSelf: 'flex-start' },
  btn:      { marginTop: 4, backgroundColor: '#EF4444', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 40 },
  btnTxt:   { fontSize: 15, fontWeight: '800', color: '#fff' },
})
