import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo'
import { useAttendanceViewModel } from '../viewmodels/useAttendanceViewModel'
import { attendanceService } from '../services/attendanceService'
import { adminService } from '../services/adminService'
import { announcementService } from '../services/announcementService'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { RootState } from '../store'
import { useAppPermissions } from '../hooks/useAppPermissions'
import PermissionsBanner from '../components/PermissionsBanner'
import { SERVER_URL } from '../services/api'
import { AttendanceSummary, Campus, UserPermission } from '../models'

function extractSsid(state: any): string | null {
  if (state.type !== NetInfoStateType.wifi) return null
  const raw = state.details?.ssid ?? state.details?.SSID ?? null
  if (typeof raw !== 'string') return null
  if (raw.includes('<unknown')) return null
  const ssid = raw.trim().replace(/^"|"$/g, '').trim()
  return ssid || null
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtLeaveDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

type MonthlySummary = {
  year: number
  month: number
  workingDays: number
  attendedDays: number
  publicHolidaysCount: number
  holidays: { name: string; date: string; amountDay: number }[]
  leaveBalance: {
    totalHolidayDays: number
    usedPermissionDays: number
    pendingPermissionDays: number
    remainingDays: number
  }
}

type DailyWork = {
  id: number
  photoPath?: string | null
  photos?: { photoPath: string }[]
  year?: number
  month?: number
  day?: number
  time?: string | null
  status?: 'pending' | 'approved' | 'rejected' | string | null
  description?: string | null
  createdAt?: string
  user?: { fullName: string | null; email: string } | null
  approver?: { fullName: string | null; email: string } | null
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const DW_STATUS: Record<string, { bg: string; text: string; icon: string }> = {
  pending:  { bg: '#FEF3C7', text: '#F59E0B', icon: 'clock' },
  approved: { bg: '#D1FAE5', text: '#10B981', icon: 'check-circle' },
  rejected: { bg: '#FEE2E2', text: '#EF4444', icon: 'times-circle' },
}

export default function HomeScreen() {
  const { user } = useSelector((s: RootState) => s.auth)
  const navigation = useNavigation<any>()
  const { todayCheckIns, isLoading, loadTodayCheckIns } = useAttendanceViewModel()
  const [monthly, setMonthly]       = useState<MonthlySummary | null>(null)
  const [dailyWorks, setDailyWorks] = useState<DailyWork[]>([])
  const now = new Date()

  const thisYear  = now.getFullYear()
  const thisMonth = now.getMonth() + 1

  // Admin state
  const isAdmin = user?.role === 'admin'
  const [adminLoading, setAdminLoading]           = useState(false)
  const [adminSummary, setAdminSummary]           = useState<AttendanceSummary | null>(null)
  const [pendingLeaves, setPendingLeaves]         = useState<UserPermission[]>([])
  const [pendingDailyWorks, setPendingDailyWorks] = useState<DailyWork[]>([])
  const [todayCheckInCount, setTodayCheckInCount] = useState<number>(0)
  const [todayCheckOutCount, setTodayCheckOutCount] = useState<number>(0)

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true)
    const todayStr = new Date().toISOString().slice(0, 10)
    try {
      await Promise.all([
        adminService.getSummary().then(setAdminSummary).catch(() => {}),
        adminService.getPermissions({ status: 'pending' }).then(setPendingLeaves).catch(() => {}),
        adminService.getAllDailyWorks({ year: thisYear, month: thisMonth })
          .then((data: DailyWork[]) => setPendingDailyWorks(data.filter(d => (d.status ?? 'pending') === 'pending')))
          .catch(() => {}),
        adminService.getAllCheckIns({ date: todayStr })
          .then((data: any[]) => {
            setTodayCheckInCount(data.filter((c: any) => c.scanType === 'check_in').length)
            setTodayCheckOutCount(data.filter((c: any) => c.scanType === 'check_out').length)
          }).catch(() => {}),
      ])
    } finally {
      setAdminLoading(false)
    }
  }, [thisYear, thisMonth])

  const [wifiSsid, setWifiSsid] = useState<string | null>(null)
  const [userCampus, setUserCampus] = useState<Campus | null>(null)

  const { permissions, allGranted, request, openSettings } = useAppPermissions()

  const [unreadCount, setUnreadCount] = useState(0)

  const loadUnread = useCallback(async () => {
    try {
      const count = await announcementService.getUnreadCount()
      setUnreadCount(count)
    } catch { setUnreadCount(0) }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await announcementService.markAllRead()
      setUnreadCount(0)
    } catch {}
  }, [])

  const openNotifications = useCallback(() => {
    markAllRead()
    if (isAdmin) {
      navigation.navigate('Manage', { screen: 'Announcements' })
    } else {
      navigation.navigate('UserAnnouncements')
    }
  }, [isAdmin, markAllRead, navigation])

  useFocusEffect(useCallback(() => { loadUnread() }, [loadUnread]))

  const loadAll = useCallback(async () => {
    if (isAdmin) {
      await Promise.all([loadTodayCheckIns(), loadAdminData()])
    } else {
      await Promise.all([
        loadTodayCheckIns(),
        attendanceService.getMonthlySummary().then(setMonthly).catch(() => {}),
        attendanceService.getMyDailyWorks(thisYear, thisMonth)
          .then(data => {
            const filtered = data.filter((d: DailyWork) => d.year === thisYear && d.month === thisMonth)
            setDailyWorks(filtered)
          }).catch(() => {}),
      ])
    }
  }, [loadTodayCheckIns, loadAdminData, isAdmin, thisYear, thisMonth])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (!user?.campusId) return
    attendanceService.getCampuses()
      .then(list => setUserCampus(list.find(c => Number(c.id) === Number(user.campusId)) ?? null))
      .catch(() => {})
  }, [user?.campusId])

  useEffect(() => {
    NetInfo.configure({ shouldFetchWiFiSSID: true })
    const unsub = NetInfo.addEventListener(state => setWifiSsid(extractSsid(state)))
    NetInfo.refresh().then(state => setWifiSsid(extractSsid(state)))
    return () => unsub()
  }, [])

  const checkIn      = todayCheckIns.find((c: any) => c.scanType === 'check_in')
  const checkOut     = todayCheckIns.find((c: any) => c.scanType === 'check_out')
  const isCheckedIn  = todayCheckIns.length > 0
  const scanCount    = todayCheckIns.length

  const renderDailyWorkItem = ({ item, index }: { item: DailyWork; index: number }) => {
    const st = DW_STATUS[item.status ?? 'pending'] ?? DW_STATUS.pending
    const photoPath = item.photos?.[0]?.photoPath ?? item.photoPath
    const day = item.day ?? (item.createdAt ? new Date(item.createdAt).getDate() : null)
    const mon = item.month ?? (item.createdAt ? new Date(item.createdAt).getMonth() + 1 : null)
    const dateStr = day && mon
      ? `${String(day).padStart(2, '0')} ${MONTH_NAMES[mon - 1]}`
      : item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '—'
    const creatorName = item.user?.fullName ?? item.user?.email ?? null
    const approverName = item.approver?.fullName ?? item.approver?.email ?? null

    return (
      <View style={[styles.dwRow, index < dailyWorks.length - 1 && styles.dwRowBorder]}>
        {photoPath ? (
          <Image source={{ uri: `${SERVER_URL}${photoPath}` }} style={styles.dwThumb} resizeMode="cover" />
        ) : (
          <View style={styles.dwThumbFallback}>
            <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.dwRowTop}>
            <Text style={styles.dwDate}>{dateStr}</Text>
            <View style={[styles.dwStatusBadge, { backgroundColor: st.bg }]}>
              <FontAwesome5 iconStyle="solid" name={st.icon as any} size={10} color={st.text} />
              <Text style={[styles.dwStatusTxt, { color: st.text }]}>{item.status ?? 'pending'}</Text>
            </View>
          </View>
          {item.description ? <Text style={styles.dwNote} numberOfLines={1}>{item.description}</Text> : null}
          <View style={styles.dwMeta}>
            {creatorName ? (
              <View style={styles.dwMetaChip}>
                <FontAwesome5 iconStyle="solid" name="user" size={9} color="#6366F1" />
                <Text style={styles.dwMetaChipTxt} numberOfLines={1}>{creatorName}</Text>
              </View>
            ) : null}
            {approverName && item.status !== 'pending' ? (
              <View style={[styles.dwMetaChip, { backgroundColor: st.bg }]}>
                <FontAwesome5 iconStyle="solid" name="check-double" size={9} color={st.text} />
                <Text style={[styles.dwMetaChipTxt, { color: st.text }]} numberOfLines={1}>{approverName}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* ── Fixed App Bar ── */}
      <View style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>{user?.fullName || user?.email || 'User'}</Text>
            <View style={styles.datePill}>
              <FontAwesome5 iconStyle="solid" name="calendar-alt" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.dateText}>{formatDate()}</Text>
            </View>
          </View>
          <View style={styles.appBarRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={openNotifications}>
              <FontAwesome5 iconStyle="solid" name="bell" size={20} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeTxt}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statusPill, isCheckedIn ? styles.statusPillIn : styles.statusPillOut]}>
          <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? '#10B981' : '#F59E0B' }]} />
          <Text style={[styles.statusPillTxt, { color: isCheckedIn ? '#10B981' : '#F59E0B' }]}>
            {isCheckedIn ? 'Checked In Today' : 'Not Yet Checked In'}
          </Text>
        </View>
      </View>

      {/* ── Permissions Banner ── */}
      {!allGranted && Platform.OS === 'android' && (
        <PermissionsBanner
          permissions={permissions}
          onRequest={request}
          onOpenSettings={openSettings}
        />
      )}

      {/* ── WiFi Warning Banner ── */}
      {!isAdmin && !user?.allowWifi && !user?.allowOutside && !user?.noCheckOut && (() => {
        const campusHasWifi = userCampus && userCampus.wifis && userCampus.wifis.length > 0
        const onCampusWifi = campusHasWifi && wifiSsid &&
          userCampus!.wifis.some(w => w.wifiName.trim().toLowerCase() === wifiSsid.trim().toLowerCase())

        if (!wifiSsid) {
          // No WiFi connected at all (on 4G / offline)
          return (
            <View style={styles.wifiBanner}>
              <FontAwesome5 iconStyle="solid" name="wifi" size={16} color="#92400E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.wifiBannerTitle}>No WiFi Connected</Text>
                <Text style={styles.wifiBannerSub}>
                  {campusHasWifi
                    ? `Connect to: ${userCampus!.wifis.map(w => `"${w.wifiName.trim()}"`).join(', ')}`
                    : 'You are not connected to any WiFi network'}
                </Text>
              </View>
            </View>
          )
        }

        if (campusHasWifi && !onCampusWifi) {
          // Connected to wrong WiFi
          return (
            <View style={styles.wifiBanner}>
              <FontAwesome5 iconStyle="solid" name="wifi" size={16} color="#92400E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.wifiBannerTitle}>Not on Campus WiFi</Text>
                <Text style={styles.wifiBannerSub}>
                  Connect to: {userCampus!.wifis.map(w => `"${w.wifiName.trim()}"`).join(', ')}
                </Text>
              </View>
            </View>
          )
        }

        return null
      })()}

      {/* ── Scrollable Content ── */}
      <FlatList
        data={[]}
        renderItem={null}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading || adminLoading} onRefresh={loadAll} tintColor="#6366F1" />}
        ListHeaderComponent={<>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          {isAdmin ? (
            <>
              <View style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome5 iconStyle="solid" name="users" size={20} color="#6366F1" />
                <Text style={styles.statNum}>{adminSummary?.totalUsers ?? '--'}</Text>
                <Text style={styles.statLbl}>Total</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
                <FontAwesome5 iconStyle="solid" name="sign-in-alt" size={20} color="#10B981" />
                <Text style={styles.statNum}>{todayCheckInCount}</Text>
                <Text style={styles.statLbl}>Check In</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
                <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={20} color="#EF4444" />
                <Text style={styles.statNum}>{todayCheckOutCount}</Text>
                <Text style={styles.statLbl}>Check Out</Text>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.statBox, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome5 iconStyle="solid" name="clock" size={20} color="#6366F1" />
                <Text style={styles.statNum}>{scanCount}</Text>
                <Text style={styles.statLbl}>Scans</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#D1FAE5' }]}>
                <FontAwesome5 iconStyle="solid" name="sign-in-alt" size={20} color="#10B981" />
                <Text style={styles.statNum}>{checkIn?.time ?? '--'}</Text>
                <Text style={styles.statLbl}>Check In</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
                <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={20} color="#EF4444" />
                <Text style={styles.statNum}>{checkOut?.time ?? '--'}</Text>
                <Text style={styles.statLbl}>Check Out</Text>
              </View>
            </>
          )}
        </View>


        {/* ── ADMIN SECTIONS ── */}
        {isAdmin && (
          <>
            {/* Pending Leave Requests */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => navigation.navigate('Manage', { screen: 'ManageDetail', params: { section: 'LeaveRequests', title: 'Leave Requests' } })}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#EEF2FF' }]}>
                  <FontAwesome5 iconStyle="solid" name="file-alt" size={18} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle}>Pending Leave Requests</Text>
                {pendingLeaves.length > 0 && (
                  <View style={[styles.adminBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.adminBadgeTxt, { color: '#F59E0B' }]}>{pendingLeaves.length}</Text>
                  </View>
                )}
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
              {adminLoading ? (
                <ActivityIndicator size="small" color="#6366F1" style={{ marginVertical: 16 }} />
              ) : pendingLeaves.length === 0 ? (
                <View style={styles.adminEmpty}>
                  <FontAwesome5 iconStyle="solid" name="check-circle" size={28} color="#10B981" />
                  <Text style={styles.adminEmptyTxt}>No pending requests</Text>
                </View>
              ) : (
                pendingLeaves.slice(0, 5).map((item, i) => (
                  <View key={item.id} style={[styles.adminRow, i < Math.min(pendingLeaves.length, 5) - 1 && styles.adminRowBorder]}>
                    <View style={[styles.adminRowIcon, { backgroundColor: '#EEF2FF' }]}>
                      <FontAwesome5 iconStyle="solid" name="user" size={14} color="#6366F1" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adminRowName} numberOfLines={1}>{item.user?.fullName ?? `User #${item.userId}`}</Text>
                      <Text style={styles.adminRowSub}>{(item as any).leaveType?.name ?? item.type}  ·  {fmtLeaveDate(item.startDate)} – {fmtLeaveDate(item.endDate)}</Text>
                    </View>
                    <View style={[styles.adminBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Text style={[styles.adminBadgeTxt, { color: '#F59E0B' }]}>Pending</Text>
                    </View>
                  </View>
                ))
              )}
              {pendingLeaves.length > 5 && (
                <TouchableOpacity
                  style={styles.adminSeeAll}
                  onPress={() => navigation.navigate('Manage', { screen: 'ManageDetail', params: { section: 'LeaveRequests', title: 'Leave Requests' } })}
                >
                  <Text style={styles.adminSeeAllTxt}>See all {pendingLeaves.length} requests</Text>
                  <FontAwesome5 iconStyle="solid" name="arrow-right" size={13} color="#6366F1" />
                </TouchableOpacity>
              )}
            </View>

            {/* Today Check-Ins */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => navigation.navigate('Manage', { screen: 'CheckIns' })}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#D1FAE5' }]}>
                  <FontAwesome5 iconStyle="solid" name="qrcode" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardTitle}>Today's Check-Ins</Text>
                <View style={[styles.adminBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.adminBadgeTxt, { color: '#10B981' }]}>{adminSummary?.checkedIn ?? 0}</Text>
                </View>
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
              {adminLoading ? (
                <ActivityIndicator size="small" color="#6366F1" style={{ marginVertical: 16 }} />
              ) : (adminSummary?.checkedIn ?? 0) === 0 ? (
                <View style={styles.adminEmpty}>
                  <FontAwesome5 iconStyle="solid" name="clock" size={28} color="#CBD5E1" />
                  <Text style={styles.adminEmptyTxt}>No check-ins yet today</Text>
                </View>
              ) : (
                <View style={styles.adminCheckInSummary}>
                  <View style={styles.adminCheckInItem}>
                    <Text style={[styles.adminCheckInNum, { color: '#10B981' }]}>{adminSummary?.checkedIn}</Text>
                    <Text style={styles.adminCheckInLbl}>Checked In</Text>
                  </View>
                  <View style={styles.adminCheckInDivider} />
                  <View style={styles.adminCheckInItem}>
                    <Text style={[styles.adminCheckInNum, { color: '#EF4444' }]}>{adminSummary?.notCheckedIn}</Text>
                    <Text style={styles.adminCheckInLbl}>Not Yet</Text>
                  </View>
                  <View style={styles.adminCheckInDivider} />
                  <View style={styles.adminCheckInItem}>
                    <Text style={[styles.adminCheckInNum, { color: '#6366F1' }]}>{adminSummary?.totalUsers}</Text>
                    <Text style={styles.adminCheckInLbl}>Total</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Pending Daily Work */}
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => navigation.navigate('Manage', { screen: 'ManageDetail', params: { section: 'DailyWork', title: 'Daily Work' } })}
                activeOpacity={0.7}
              >
                <View style={[styles.cardIconBox, { backgroundColor: '#FFEDD5' }]}>
                  <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
                </View>
                <Text style={styles.cardTitle}>Pending Daily Work</Text>
                {pendingDailyWorks.length > 0 && (
                  <View style={[styles.adminBadge, { backgroundColor: '#FFEDD5' }]}>
                    <Text style={[styles.adminBadgeTxt, { color: '#F97316' }]}>{pendingDailyWorks.length}</Text>
                  </View>
                )}
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#94A3B8" />
              </TouchableOpacity>
              {adminLoading ? (
                <ActivityIndicator size="small" color="#6366F1" style={{ marginVertical: 16 }} />
              ) : pendingDailyWorks.length === 0 ? (
                <View style={styles.adminEmpty}>
                  <FontAwesome5 iconStyle="solid" name="check-circle" size={28} color="#10B981" />
                  <Text style={styles.adminEmptyTxt}>No pending daily work</Text>
                </View>
              ) : (
                pendingDailyWorks.slice(0, 5).map((item, i) => {
                  const photoPath = item.photos?.[0]?.photoPath ?? item.photoPath
                  return (
                    <View key={item.id} style={[styles.adminRow, i < Math.min(pendingDailyWorks.length, 5) - 1 && styles.adminRowBorder]}>
                      {photoPath ? (
                        <Image source={{ uri: `${SERVER_URL}${photoPath}` }} style={styles.adminThumb} />
                      ) : (
                        <View style={[styles.adminRowIcon, { backgroundColor: '#FFEDD5' }]}>
                          <FontAwesome5 iconStyle="solid" name="briefcase" size={14} color="#F97316" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.adminRowName} numberOfLines={1}>{item.user?.fullName ?? 'Unknown'}</Text>
                        <Text style={styles.adminRowSub} numberOfLines={1}>{item.description ?? 'No description'}</Text>
                      </View>
                      <View style={[styles.adminBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.adminBadgeTxt, { color: '#F59E0B' }]}>Pending</Text>
                      </View>
                    </View>
                  )
                })
              )}
              {pendingDailyWorks.length > 5 && (
                <TouchableOpacity
                  style={styles.adminSeeAll}
                  onPress={() => navigation.navigate('Manage', { screen: 'ManageDetail', params: { section: 'DailyWork', title: 'Daily Work' } })}
                >
                  <Text style={styles.adminSeeAllTxt}>See all {pendingDailyWorks.length} records</Text>
                  <FontAwesome5 iconStyle="solid" name="arrow-right" size={13} color="#6366F1" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* ── EMPLOYEE SECTIONS ── */}
        {/* ── Leave Balance ── */}
        {!isAdmin && monthly?.leaveBalance && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome5 iconStyle="solid" name="umbrella" size={18} color="#6366F1" />
              </View>
              <Text style={styles.cardTitle}>Leave Balance {monthly.year}</Text>
              <View style={[
                styles.leaveBadge,
                { backgroundColor: monthly.leaveBalance.remainingDays > 0 ? '#D1FAE5' : '#FEE2E2' },
              ]}>
                <Text style={[
                  styles.leaveBadgeTxt,
                  { color: monthly.leaveBalance.remainingDays > 0 ? '#10B981' : '#EF4444' },
                ]}>
                  {monthly.leaveBalance.remainingDays}d left
                </Text>
              </View>
            </View>

            <View style={styles.leaveBarBg}>
              <View style={[styles.leaveBarFill, {
                width: `${monthly.leaveBalance.totalHolidayDays > 0
                  ? Math.min(100, Math.round((monthly.leaveBalance.usedPermissionDays / monthly.leaveBalance.totalHolidayDays) * 100))
                  : 0}%` as any,
              }]} />
              {monthly.leaveBalance.pendingPermissionDays > 0 && (
                <View style={[styles.leaveBarPending, {
                  width: `${monthly.leaveBalance.totalHolidayDays > 0
                    ? Math.min(
                        100 - Math.round((monthly.leaveBalance.usedPermissionDays / monthly.leaveBalance.totalHolidayDays) * 100),
                        Math.round((monthly.leaveBalance.pendingPermissionDays / monthly.leaveBalance.totalHolidayDays) * 100)
                      )
                    : 0}%` as any,
                }]} />
              )}
            </View>

            <View style={styles.leaveRow}>
              <View style={styles.leaveStat}>
                <Text style={styles.leaveStatNum}>{monthly.leaveBalance.totalHolidayDays}</Text>
                <Text style={styles.leaveStatLbl}>Total</Text>
              </View>
              <View style={styles.leaveDivider} />
              <View style={styles.leaveStat}>
                <Text style={[styles.leaveStatNum, { color: '#EF4444' }]}>{monthly.leaveBalance.usedPermissionDays}</Text>
                <Text style={styles.leaveStatLbl}>Used</Text>
              </View>
              {monthly.leaveBalance.pendingPermissionDays > 0 && (
                <>
                  <View style={styles.leaveDivider} />
                  <View style={styles.leaveStat}>
                    <Text style={[styles.leaveStatNum, { color: '#F59E0B' }]}>{monthly.leaveBalance.pendingPermissionDays}</Text>
                    <Text style={styles.leaveStatLbl}>Pending</Text>
                  </View>
                </>
              )}
              <View style={styles.leaveDivider} />
              <View style={styles.leaveStat}>
                <Text style={[styles.leaveStatNum, { color: '#10B981' }]}>{monthly.leaveBalance.remainingDays}</Text>
                <Text style={styles.leaveStatLbl}>Remaining</Text>
              </View>
            </View>
          </View>
        )}
        {/* ── Today's Activity (employee only) ── */}
        {!isAdmin && <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          {todayCheckIns.length === 0 ? (
            <View style={styles.emptyBox}>
              <FontAwesome5 iconStyle="solid" name="calendar-alt" size={40} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No activity yet</Text>
              <Text style={styles.emptyText}>Tap the Scan tab to check in</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {todayCheckIns.map((ci: any, i: number) => (
                <View key={ci.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: ci.scanType === 'check_in' ? '#10B981' : '#EF4444' }]} />
                    {i < todayCheckIns.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={[styles.timelineCard, i === todayCheckIns.length - 1 && { marginBottom: 0 }]}>
                    <View style={styles.timelineCardInner}>
                      <View style={[styles.timelineIcon, { backgroundColor: ci.scanType === 'check_in' ? '#D1FAE5' : '#FEE2E2' }]}>
                        <FontAwesome5 iconStyle="solid"
                          name={ci.scanType === 'check_in' ? 'sign-in-alt' : 'sign-out-alt'}
                          size={16}
                          color={ci.scanType === 'check_in' ? '#10B981' : '#EF4444'}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timelineType}>{ci.scanType === 'check_in' ? 'Check In' : 'Check Out'}</Text>
                        <Text style={styles.timelineTime}>{ci.time}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: ci.scanType === 'check_in' ? '#D1FAE5' : '#FEE2E2' }]}>
                        <Text style={[styles.badgeTxt, { color: ci.scanType === 'check_in' ? '#10B981' : '#EF4444' }]}>
                          {ci.scanType === 'check_in' ? 'IN' : 'OUT'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>}
        {/* ── Daily Work (employee only) ── */}
        {!isAdmin && <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: '#FFEDD5' }]}>
              <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
            </View>
            <Text style={styles.cardTitle}>Daily Work</Text>
            <View style={styles.dwMonthBadge}>
              <Text style={styles.dwMonthBadgeTxt}>{MONTH_NAMES[now.getMonth()]}</Text>
            </View>
            <View style={[styles.dwCountChip, { backgroundColor: dailyWorks.length > 0 ? '#FFEDD5' : '#F1F5F9' }]}>
              <Text style={[styles.dwCountTxt, { color: dailyWorks.length > 0 ? '#F97316' : '#94A3B8' }]}>
                {dailyWorks.length}
              </Text>
            </View>
          </View>

          {dailyWorks.length === 0 ? (
            <View style={styles.dwEmpty}>
              <FontAwesome5 iconStyle="solid" name="briefcase" size={28} color="#CBD5E1" />
              <Text style={styles.dwEmptyTxt}>No records this month</Text>
            </View>
          ) : (
            <FlatList
              data={dailyWorks}
              keyExtractor={i => String(i.id)}
              renderItem={renderDailyWorkItem}
              scrollEnabled={false}
            />
          )}
        </View>}

        </>}
      />

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flex: 1 },
  content: { paddingBottom: 120 },

  // App Bar
  appBar: { backgroundColor: '#6366F1', paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20 },
  appBarInner: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  datePill: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#6366F1' },
  notifBadge: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#6366F1' },
  notifBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarTxt: { fontSize: 17, fontWeight: '800', color: '#fff' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusPillIn: { backgroundColor: 'rgba(16,185,129,0.15)' },
  statusPillOut: { backgroundColor: 'rgba(245,158,11,0.15)' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusPillTxt: { fontSize: 12, fontWeight: '700' },

  // WiFi Warning Banner
  wifiBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#FDE68A' },
  wifiBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  wifiBannerSub: { fontSize: 11, color: '#B45309', marginTop: 1 },

  // Quick Stats
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginTop: 14 },
  statBox: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
  statLbl: { fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },

  // Shared card
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 18, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 16, elevation: 4, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },

// Leave balance
  leaveBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  leaveBadgeTxt: { fontSize: 13, fontWeight: '800' },
  leaveBarBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, flexDirection: 'row', overflow: 'hidden' },
  leaveBarFill: { height: 10, backgroundColor: '#EF4444', borderRadius: 5 },
  leaveBarPending: { height: 10, backgroundColor: '#F59E0B' },
  leaveRow: { flexDirection: 'row', alignItems: 'center' },
  leaveStat: { flex: 1, alignItems: 'center', gap: 3 },
  leaveStatNum: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  leaveStatLbl: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },
  leaveDivider: { width: 1, height: 32, backgroundColor: '#F1F5F9' },

  // Daily Work (in-card FlatList)
  dwCountChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dwCountTxt: { fontSize: 13, fontWeight: '800' },
  dwMonthBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: '#FFEDD5' },
  dwMonthBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#F97316' },
  dwEmpty: { alignItems: 'center', paddingVertical: 16, gap: 6 },
  dwEmptyTxt: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  dwRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  dwRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  dwThumb: { width: 44, height: 44, borderRadius: 10 },
  dwThumbFallback: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' },
  dwRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 },
  dwDate: { fontSize: 13, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 6 },
  dwNote: { fontSize: 11, color: '#64748B', marginTop: 1 },
  dwStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  dwStatusTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  dwMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  dwMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, maxWidth: 140 },
  dwMetaChipTxt: { fontSize: 10, fontWeight: '600', color: '#6366F1' },

  // Activity feed
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 14 },
  emptyBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#64748B' },
  emptyText: { fontSize: 13, color: '#94A3B8' },

  timeline: {},
  timelineItem: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  timelineCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  timelineCardInner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  timelineIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timelineType: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  timelineTime: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeTxt: { fontSize: 11, fontWeight: '700' },

  // Admin dashboard
  adminBadge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  adminBadgeTxt:      { fontSize: 13, fontWeight: '800' },
  adminEmpty:         { alignItems: 'center', paddingVertical: 18, gap: 6 },
  adminEmptyTxt:      { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  adminRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  adminRowBorder:     { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  adminRowIcon:       { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  adminThumb:         { width: 36, height: 36, borderRadius: 10 },
  adminRowName:       { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  adminRowSub:        { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  adminSeeAll:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  adminSeeAllTxt:     { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  adminCheckInSummary:{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  adminCheckInItem:   { flex: 1, alignItems: 'center', gap: 4 },
  adminCheckInNum:    { fontSize: 28, fontWeight: '900', color: '#1E293B' },
  adminCheckInLbl:    { fontSize: 11, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  adminCheckInDivider:{ width: 1, height: 40, backgroundColor: '#F1F5F9' },

})
