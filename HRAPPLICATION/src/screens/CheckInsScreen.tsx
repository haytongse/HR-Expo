import React, { useState, useCallback, useMemo } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, TextInput, Modal, ScrollView,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import RNBlobUtil from 'react-native-blob-util'
import Share from 'react-native-share'
import XLSX from 'xlsx'
import { adminService } from '../services/adminService'
import { User, TimeTable, UserPermission } from '../models'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const AVATAR_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanPair   = { in?: string; out?: string }
type DayRow     = { uid: number; name: string; year: number; month: number; day: number; pairs: ScanPair[] }

// ─── Table layout ─────────────────────────────────────────────────────────────
const COL_NO       = 28
const COL_EMPLOYEE = 130
const COL_DATE     = 64
const COL_TIME     = 72
const MAX_PAIRS    = 2
const TABLE_WIDTH  = COL_NO + COL_EMPLOYEE + COL_DATE + COL_TIME * MAX_PAIRS * 2

const ORG_NAME    = 'HR Management System'
const ORG_ADDRESS = 'Phnom Penh, Cambodia'

// ─── Excel export ─────────────────────────────────────────────────────────────
async function exportMonthlyExcel(records: any[], year: number, month: number): Promise<void> {
  const daysInMonth = new Date(year, month, 0).getDate()
  type DayEntry = { in?: string; out?: string }
  const userMap = new Map<number, { name: string; days: Record<number, DayEntry> }>()

  for (const r of records) {
    const uid  = r.userId ?? r.user_id
    const type = r.scanType ?? r.scan_type
    const name = r.user?.fullName || r.user?.full_name || r.user?.email || `User #${uid}`
    const day  = Number(r.day ?? 0)
    if (!day) continue
    if (!userMap.has(uid)) userMap.set(uid, { name, days: {} })
    const entry = userMap.get(uid)!
    if (!entry.days[day]) entry.days[day] = {}
    if (type === 'check_in'  && !entry.days[day].in)  entry.days[day].in  = r.time ?? ''
    if (type === 'check_out' && !entry.days[day].out) entry.days[day].out = r.time ?? ''
  }

  const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => {
    const d   = i + 1
    const dow = new Date(year, month - 1, d).getDay()
    return `${DAY_SHORT[dow]} ${d}`
  })
  const dataRows = Array.from(userMap.values()).map(({ name, days }) => [
    name,
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const e = days[i + 1]
      if (!e) return '-'
      return `${e.in || '-'} / ${e.out || '-'}`
    }),
  ])

  const periodLabel = `${MONTH_NAMES[month - 1]} ${year}`
  const generated   = `Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
  const totalCols   = daysInMonth + 1

  const sheetData = [
    [ORG_NAME], [ORG_ADDRESS],
    [`Attendance Report — ${periodLabel}`], [generated], [],
    ['Employee', ...dayHeaders], ...dataRows, [],
    ['Note: Format per cell = Check-in / Check-out time'], [],
    ['Prepared by:', '', '', 'Checked by:', '', '', 'Approved by:'],
    ['', '', '', '', '', '', ''],
    ['______________________', '', '', '______________________', '', '', '______________________'],
    ['Name / Date', '', '', 'Name / Date', '', '', 'Name / Date'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  ws['!cols'] = [{ wch: 28 }, ...Array.from({ length: daysInMonth }, () => ({ wch: 14 }))]
  const lastCol = totalCols - 1
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: lastCol } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: lastCol } },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, periodLabel)
  const base64   = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })
  const filename = `checkins_${MONTH_NAMES[month - 1]}_${year}.xlsx`
  const path     = `${RNBlobUtil.fs.dirs.CacheDir}/${filename}`
  await RNBlobUtil.fs.writeFile(path, base64, 'base64')
  await Share.open({ url: `file://${path}`, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename, failOnCancel: false })
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CheckInsScreen() {
  const navigation = useNavigation<any>()
  const insets     = useSafeAreaInsets()
  const now        = new Date()

  const [year, setYear]             = useState(now.getFullYear())
  const [month, setMonth]           = useState(now.getMonth() + 1)
  const [records, setRecords]                   = useState<any[]>([])
  const [allUsers, setAllUsers]                 = useState<User[]>([])
  const [allTimetables, setAllTimetables]       = useState<TimeTable[]>([])
  const [approvedPerms, setApprovedPerms]       = useState<UserPermission[]>([])
  const [loading, setLoading]                   = useState(true)
  const [refreshing, setRefreshing]             = useState(false)
  const [query, setQuery]                       = useState('')
  const [exporting, setExporting]               = useState(false)
  const [showMonthPicker, setShowMonthPicker]   = useState(false)

  // ── Load monthly data ───────────────────────────────────────────────────────
  const load = useCallback(async (y: number, m: number, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [res, users, timetables, perms] = await Promise.all([
        adminService.getMonthlyCheckIns(y, m),
        adminService.getUsers(),
        adminService.getTimetables(),
        adminService.getPermissions({ status: 'approved' }),
      ])
      setRecords(Array.isArray(res) ? res : (res?.data ?? []))
      setAllUsers(Array.isArray(users) ? users : [])
      setAllTimetables(Array.isArray(timetables) ? timetables : [])
      setApprovedPerms(Array.isArray(perms) ? perms : [])
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load(year, month) }, [load, year, month]))

  const applyMonth = (y: number, m: number) => {
    setYear(y); setMonth(m); setShowMonthPicker(false); setQuery('')
  }

  // ── Group raw scans → one DayRow per (employee × day), all days in month ───
  const rows = useMemo<DayRow[]>(() => {
    const daysInMonth = new Date(year, month, 0).getDate()

    // Collect all employees and their scans per day
    const empMap = new Map<number, { name: string; scansByDay: Map<number, Array<{ type: string; time: string }>> }>()
    for (const r of records) {
      const uid  = r.userId ?? r.user_id
      const type = r.scanType ?? r.scan_type
      const name = r.user?.fullName || r.user?.full_name || r.user?.email || `User #${uid}`
      const day  = Number(r.day ?? 0)
      if (!day) continue
      if (!empMap.has(uid)) empMap.set(uid, { name, scansByDay: new Map() })
      const emp = empMap.get(uid)!
      if (!emp.scansByDay.has(day)) emp.scansByDay.set(day, [])
      emp.scansByDay.get(day)!.push({ type: type ?? '', time: r.time ?? '' })
    }

    // Expand to all days of the month for each employee
    const timeToMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return (h || 0) * 60 + (m || 0)
    }

    const result: DayRow[] = []
    for (const [uid, { name, scansByDay }] of empMap) {
      for (let d = 1; d <= daysInMonth; d++) {
        const allScans = scansByDay.get(d) ?? []
        const sorted = [...allScans]
          .filter(s => s.time)
          .sort((a, b) => timeToMin(a.time) - timeToMin(b.time))
        // Build pairs by flow: check_in opens a new pair, check_out closes the current one.
        // An orphan check_out (no open pair) starts a pair with only the out slot filled.
        const pairs: ScanPair[] = []
        for (const scan of sorted) {
          if (scan.type === 'check_in') {
            pairs.push({ in: scan.time })
          } else {
            const last = pairs[pairs.length - 1]
            if (last && last.out === undefined) {
              last.out = scan.time
            } else {
              pairs.push({ out: scan.time })
            }
          }
        }
        result.push({ uid, name, year, month, day: d, pairs })
      }
    }

    return result.sort((a, b) => a.day !== b.day ? a.day - b.day : a.name.localeCompare(b.name))
  }, [records, year, month])

  const filtered = useMemo(() => {
    if (!query.trim()) return rows
    const q = query.toLowerCase()
    return rows.filter(r => r.name.toLowerCase().includes(q))
  }, [rows, query])

  // unique employees
  const totalEmployees = useMemo(() => new Set(rows.map(r => r.uid)).size, [rows])
  const checkedIn      = useMemo(() => new Set(rows.filter(r => r.pairs.some(p => p.in)).map(r => r.uid)).size, [rows])
  const checkedOut     = useMemo(() => new Set(rows.filter(r => r.pairs.some(p => p.out)).map(r => r.uid)).size, [rows])

  const isFutureMonth  = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)

  const handleExport = async () => {
    setExporting(true)
    try {
      if (!records.length) return
      await exportMonthlyExcel(records, year, month)
    } catch (e: any) {
      if (!e?.message?.includes('cancel')) console.warn('Export failed', e)
    } finally { setExporting(false) }
  }

  // ── Day status ──────────────────────────────────────────────────────────────
  const getDayStatus = useCallback((item: DayRow): 'present' | 'weekend' | 'permission' | 'day_off' | 'absent' | 'future' => {
    if (item.pairs.length > 0) return 'present'

    const dateStr = `${item.year}-${String(item.month).padStart(2,'0')}-${String(item.day).padStart(2,'0')}`
    const todayStr = now.toISOString().slice(0, 10)
    const isFuture = dateStr > todayStr

    const dow = new Date(item.year, item.month - 1, item.day).getDay()

    if (dow === 0 || dow === 6) return isFuture ? 'future' : 'weekend'

    const hasPermission = approvedPerms.some(p =>
      p.userId === item.uid &&
      dateStr >= p.startDate.slice(0, 10) &&
      dateStr <= p.endDate.slice(0, 10)
    )
    if (hasPermission) return 'permission'

    if (isFuture) return 'future'

    const user = allUsers.find(u => u.id === item.uid)
    const shift = user?.shiftSchedule
    if (!shift) return 'day_off'

    if (shift.startDate && dateStr < shift.startDate.slice(0, 10)) return 'day_off'
    if (shift.endDate   && dateStr > shift.endDate.slice(0, 10))   return 'day_off'

    const hasTimetable = allTimetables.some(t => t.shiftScheduleId === shift.id && t.dayOfWeek === dow)
    if (!hasTimetable) return 'day_off'

    return 'absent'
  }, [approvedPerms, allUsers, allTimetables, now])

  // ── Table header ────────────────────────────────────────────────────────────
  const TableHeader = () => (
    <View style={[styles.tableHeader, { width: TABLE_WIDTH }]}>
      <Text style={[styles.th, { width: COL_NO }]}>#</Text>
      <Text style={[styles.th, { width: COL_EMPLOYEE }]}>Employee</Text>
      <Text style={[styles.th, { width: COL_DATE }]}>Date</Text>
      {Array.from({ length: MAX_PAIRS }, (_, p) => (
        <React.Fragment key={p}>
          <Text style={[styles.th, { width: COL_TIME, color: '#10B981' }]}>{p === 0 ? 'Check In' : `In ${p+1}`}</Text>
          <Text style={[styles.th, { width: COL_TIME, color: '#EF4444' }]}>{p === 0 ? 'Check Out' : `Out ${p+1}`}</Text>
        </React.Fragment>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>

        {/* Row 1: back · title · export */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Check-ins</Text>
            <Text style={styles.headerSub}>{totalEmployees} employees · {rows.length} records</Text>
          </View>
          <TouchableOpacity style={[styles.exportBtn, exporting && { opacity: 0.6 }]} onPress={handleExport} disabled={exporting}>
            {exporting ? <ActivityIndicator size="small" color="#fff" /> : <FontAwesome5 iconStyle="solid" name="download" size={16} color="#fff" />}
            <Text style={styles.exportTxt}>{exporting ? 'Loading…' : 'Export'}</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Month-Year selector */}
        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowMonthPicker(true)} activeOpacity={0.8}>
          <TouchableOpacity style={styles.monthArrow} onPress={() => {
            const prev = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 }
            applyMonth(prev.y, prev.m)
          }}>
            <FontAwesome5 iconStyle="solid" name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.monthPill}>
            <FontAwesome5 iconStyle="solid" name="calendar-alt" size={14} color="#C7D2FE" />
            <Text style={styles.monthText}>{MONTH_NAMES[month - 1]}  {year}</Text>
            <FontAwesome5 iconStyle="solid" name="chevron-down" size={13} color="rgba(255,255,255,0.6)" />
          </View>

          <TouchableOpacity
            style={[styles.monthArrow, isFutureMonth && { opacity: 0.35 }]}
            onPress={() => {
              const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
              applyMonth(next.y, next.m)
            }}
            disabled={isFutureMonth}
          >
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Row 3: summary pills */}
        <View style={styles.pillsRow}>
          <View style={[styles.pill, { backgroundColor: 'rgba(16,185,129,0.2)' }]}>
            <FontAwesome5 iconStyle="solid" name="sign-in-alt" size={13} color="#10B981" />
            <Text style={[styles.pillTxt, { color: '#10B981' }]}>{checkedIn} Checked In</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
            <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={13} color="#EF4444" />
            <Text style={[styles.pillTxt, { color: '#EF4444' }]}>{checkedOut} Checked Out</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <FontAwesome5 iconStyle="solid" name="users" size={13} color="#fff" />
            <Text style={[styles.pillTxt, { color: '#fff' }]}>{totalEmployees} Total</Text>
          </View>
        </View>

        {/* Row 4: search */}
        <View style={styles.searchBar}>
          <FontAwesome5 iconStyle="solid" name="search" size={16} color="rgba(255,255,255,0.55)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee name…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <FontAwesome5 iconStyle="solid" name="times-circle" size={16} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <FontAwesome5 iconStyle="solid" name={query ? 'search' : 'qrcode'} size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>{query ? 'No results' : 'No check-ins'}</Text>
          <Text style={styles.emptySub}>
            {query ? `No employees match "${query}"` : `No records for ${MONTH_NAMES[month-1]} ${year}`}
          </Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ width: TABLE_WIDTH }}>
            <TableHeader />
            <FlatList
              data={filtered}
              keyExtractor={item => `${item.uid}-${item.day}`}
              contentContainerStyle={{ paddingBottom: 120 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(year, month, true) }} colors={['#6366F1']} />}
              renderItem={({ item, index }) => {
                const color  = avatarColor(item.name)
                const isEven = index % 2 === 0
                const dow    = new Date(item.year, item.month - 1, item.day).getDay()
                const status = getDayStatus(item)

                const STATUS_STYLE: Record<string, { bg: string; txt: string; label: string }> = {
                  weekend:    { bg: '#FEE2E2', txt: '#EF4444', label: 'Weekend' },
                  permission: { bg: '#EEF2FF', txt: '#6366F1', label: 'Permission' },
                  day_off:    { bg: '#F1F5F9', txt: '#94A3B8', label: 'Day Off' },
                  absent:     { bg: '#FEF3C7', txt: '#F59E0B', label: 'Absent' },
                  future:     { bg: '#F8FAFC', txt: '#CBD5E1', label: '—' },
                }

                return (
                  <View style={[
                    styles.row,
                    isEven && styles.rowEven,
                    status === 'absent'     && styles.rowAbsent,
                    status === 'permission' && { backgroundColor: '#F5F3FF' },
                    { width: TABLE_WIDTH },
                  ]}>
                    {/* # */}
                    <Text style={[styles.cell, { width: COL_NO, color: '#94A3B8', textAlign: 'center', fontWeight: '700' }]}>
                      {index + 1}
                    </Text>
                    {/* Employee */}
                    <TouchableOpacity
                      style={[styles.cellEmployee, { width: COL_EMPLOYEE }]}
                      activeOpacity={0.6}
                      onPress={() => navigation.navigate('ManageDetail', { section: 'Users', title: 'Users', highlightUserId: item.uid })}
                    >
                      <View style={[styles.avatarDot, { backgroundColor: color }]} />
                      <Text style={[styles.rowName, status !== 'present' && { color: '#94A3B8' }]} numberOfLines={1}>{item.name}</Text>
                      <FontAwesome5 iconStyle="solid" name="chevron-right" size={8} color="#CBD5E1" style={{ marginLeft: 2 }} />
                    </TouchableOpacity>
                    {/* Date */}
                    <View style={[styles.cellCenter, { width: COL_DATE }]}>
                      <Text style={[styles.dateDay, dow === 0 || dow === 6 ? { color: '#EF4444' } : null]}>
                        {String(item.day).padStart(2,'0')}
                      </Text>
                      <Text style={[styles.dateMonthYear, dow === 0 || dow === 6 ? { color: '#EF4444' } : null]}>
                        {DAY_SHORT[dow]} {MONTH_NAMES[(item.month||1)-1]}
                      </Text>
                    </View>
                    {/* Scan pairs or status badge */}
                    {status !== 'present' ? (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_STYLE[status].bg }]}>
                          <Text style={[styles.statusBadgeTxt, { color: STATUS_STYLE[status].txt }]}>
                            {STATUS_STYLE[status].label}
                          </Text>
                        </View>
                      </View>
                    ) : Array.from({ length: MAX_PAIRS }, (_, p) => {
                      const pair = item.pairs[p]
                      return (
                        <React.Fragment key={p}>
                          <View style={[styles.cellCenter, { width: COL_TIME }]}>
                            {pair?.in ? (
                              <View style={[styles.timePill, { backgroundColor: '#D1FAE5' }]}>
                                <FontAwesome5 iconStyle="solid" name="sign-in-alt" size={10} color="#10B981" />
                                <Text style={[styles.timeTxt, { color: '#10B981' }]}>{pair.in}</Text>
                              </View>
                            ) : <Text style={styles.timeDash}>—</Text>}
                          </View>
                          <View style={[styles.cellCenter, { width: COL_TIME }]}>
                            {pair?.out ? (
                              <View style={[styles.timePill, { backgroundColor: '#FEE2E2' }]}>
                                <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={10} color="#EF4444" />
                                <Text style={[styles.timeTxt, { color: '#EF4444' }]}>{pair.out}</Text>
                              </View>
                            ) : <Text style={styles.timeDash}>—</Text>}
                          </View>
                        </React.Fragment>
                      )
                    })}
                  </View>
                )
              }}
            />
          </View>
        </ScrollView>
      )}

      {/* ── Month-Year Picker Modal ────────────────────────────────────── */}
      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerTitle}>Select Month</Text>

            {/* Year navigator */}
            <View style={styles.pickerYearRow}>
              <TouchableOpacity style={styles.pickerArrow} onPress={() => setYear(y => y - 1)}>
                <FontAwesome5 iconStyle="solid" name="chevron-left" size={20} color="#6366F1" />
              </TouchableOpacity>
              <Text style={styles.pickerYear}>{year}</Text>
              <TouchableOpacity
                style={styles.pickerArrow}
                onPress={() => setYear(y => y + 1)}
                disabled={year >= now.getFullYear()}
              >
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={20} color={year >= now.getFullYear() ? '#CBD5E1' : '#6366F1'} />
              </TouchableOpacity>
            </View>

            {/* Month grid */}
            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((m, i) => {
                const mNum      = i + 1
                const isActive  = mNum === month && year === now.getFullYear() ? true : mNum === month
                const isFuturM  = year === now.getFullYear() && mNum > now.getMonth() + 1
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthCell, isActive && styles.monthCellActive, isFuturM && styles.monthCellDisabled]}
                    onPress={() => !isFuturM && applyMonth(year, mNum)}
                    disabled={isFuturM}
                  >
                    <Text style={[styles.monthCellTxt, isActive && styles.monthCellTxtActive, isFuturM && styles.monthCellTxtDisabled]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity style={styles.pickerClose} onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.pickerCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingBottom: 14, gap: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  exportTxt: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Month selector row
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  monthPill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  monthText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillTxt: { fontSize: 12, fontWeight: '700' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 14, color: '#fff', padding: 0 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: '#CBD5E1' },
  th: { fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowEven: { backgroundColor: '#F8FAFC' },
  cell: { fontSize: 12 },
  cellEmployee: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 4 },
  cellCenter: { alignItems: 'center', justifyContent: 'center' },
  avatarDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  rowName: { fontSize: 12, fontWeight: '700', color: '#1E293B', flex: 1 },
  dateDay: { fontSize: 15, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  dateMonthYear: { fontSize: 10, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 7 },
  timeTxt: { fontSize: 10, fontWeight: '700' },
  timeDash: { fontSize: 14, color: '#E2E8F0', fontWeight: '500' },
  rowAbsent: { backgroundColor: '#FFFBEB' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeTxt: { fontSize: 11, fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },

  // Picker modal
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', gap: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  pickerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  pickerYearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  pickerArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  pickerYear: { fontSize: 22, fontWeight: '800', color: '#1E293B', minWidth: 60, textAlign: 'center' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell: { width: '30%', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  monthCellActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  monthCellDisabled: { opacity: 0.35 },
  monthCellTxt: { fontSize: 14, fontWeight: '600', color: '#475569' },
  monthCellTxtActive: { color: '#fff', fontWeight: '800' },
  monthCellTxtDisabled: { color: '#CBD5E1' },
  pickerClose: { paddingVertical: 13, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  pickerCloseTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
})
