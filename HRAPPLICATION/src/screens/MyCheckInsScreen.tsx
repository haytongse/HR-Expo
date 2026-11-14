import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, StatusBar, ScrollView,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useAuthViewModel } from '../viewmodels/useAuthViewModel'
import { attendanceService } from '../services/attendanceService'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ─── Table layout (mirrors admin CheckInsScreen) ──────────────────────────────
const COL_NO      = 28
const COL_DATE    = 64
const COL_PERIOD  = 90
const COL_TIME    = 72
const MAX_PAIRS   = 2
const TABLE_WIDTH = COL_NO + COL_DATE + COL_PERIOD + COL_TIME * MAX_PAIRS * 2

// ─── Types ────────────────────────────────────────────────────────────────────
type ScanPair = { in?: string; out?: string }
interface DayRow {
  day: number
  dow: number
  pairs: ScanPair[]
  period: string | null
  status: 'present' | 'weekend' | 'no_record' | 'future'
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MyCheckInsScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const { user }   = useAuthViewModel()

  const now = new Date()
  const [year,  setYear]            = useState(now.getFullYear())
  const [month, setMonth]           = useState(now.getMonth() + 1)
  const [records, setRecords]       = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [campusName, setCampusName] = useState('')
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (y: number, m: number, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await attendanceService.getCheckIns(y, m)
      setRecords(Array.isArray(data) ? data : [])
    } catch { setRecords([]) }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { load(year, month) }, [load, year, month])

  useEffect(() => {
    if (!user?.campusId) { setCampusName(''); return }
    attendanceService.getCampuses().then((list: any[]) => {
      const c = list.find((x: any) => x.id === user.campusId)
      setCampusName(c?.fullName ?? c?.name ?? '')
    }).catch(() => {})
  }, [user?.campusId])

  const applyMonth = (y: number, m: number) => {
    setYear(y); setMonth(m); setShowMonthPicker(false)
  }

  const isFutureMonth = year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)

  // ── Build rows: one per calendar day ────────────────────────────────────
  const rows = useMemo<DayRow[]>(() => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const todayStr = now.toISOString().slice(0, 10)

    // Group scans by day
    const byDay = new Map<number, Array<{ type: string; time: string; period: string | null }>>()
    for (const r of records) {
      const d    = Number(r.day ?? 0)
      const type = r.scanType ?? r.scan_type ?? ''
      const time = r.time ?? ''
      const period = r.shiftPeriod ?? r.shift_period ?? null
      if (!d) continue
      if (!byDay.has(d)) byDay.set(d, [])
      byDay.get(d)!.push({ type, time, period })
    }

    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return (h||0)*60+(m||0) }

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const dow = new Date(year, month - 1, day).getDay()
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
      const isFuture = dateStr > todayStr

      const scans = byDay.get(day) ?? []
      if (scans.length > 0) {
        // Build check-in / check-out pairs (same logic as admin)
        const sorted = [...scans].filter(s => s.time).sort((a, b) => toMin(a.time) - toMin(b.time))
        const pairs: ScanPair[] = []
        for (const s of sorted) {
          if (s.type === 'check_in') {
            pairs.push({ in: s.time })
          } else {
            const last = pairs[pairs.length - 1]
            if (last && last.out === undefined) last.out = s.time
            else pairs.push({ out: s.time })
          }
        }
        const period = scans.find(s => s.period)?.period ?? null
        return { day, dow, pairs, period, status: 'present' as const }
      }

      if (dow === 0 || dow === 6) return { day, dow, pairs: [], period: null, status: 'weekend' as const }
      if (isFuture)               return { day, dow, pairs: [], period: null, status: 'future'  as const }
      return                               { day, dow, pairs: [], period: null, status: 'no_record' as const }
    })
  }, [records, year, month, now])

  // ── Summary stats ────────────────────────────────────────────────────────
  const presentDays = rows.filter(r => r.status === 'present').length
  const totalScans  = records.length
  const noCheckOut  = rows.filter(r =>
    r.status === 'present' && r.pairs.some(p => p.in) && !r.pairs.some(p => p.out)
  ).length

  // ── Table header ─────────────────────────────────────────────────────────
  const TableHeader = () => (
    <View style={[styles.tableHeader, { width: TABLE_WIDTH }]}>
      <Text style={[styles.th, { width: COL_NO }]}>#</Text>
      <Text style={[styles.th, { width: COL_DATE }]}>Date</Text>
      <Text style={[styles.th, { width: COL_PERIOD }]}>Shift</Text>
      {Array.from({ length: MAX_PAIRS }, (_, p) => (
        <React.Fragment key={p}>
          <Text style={[styles.th, { width: COL_TIME, color: '#10B981' }]}>
            {p === 0 ? 'Check In' : `In ${p + 1}`}
          </Text>
          <Text style={[styles.th, { width: COL_TIME, color: '#EF4444' }]}>
            {p === 0 ? 'Check Out' : `Out ${p + 1}`}
          </Text>
        </React.Fragment>
      ))}
    </View>
  )

  const STATUS_STYLE: Record<string, { bg: string; txt: string; label: string }> = {
    weekend:   { bg: '#FEE2E2', txt: '#EF4444', label: 'Weekend' },
    no_record: { bg: '#FEF3C7', txt: '#F59E0B', label: 'No Record' },
    future:    { bg: '#F8FAFC', txt: '#CBD5E1', label: '—' },
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>

        {/* Row 1: back · title */}
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>My Check-ins</Text>
            <Text style={styles.headerSub}>{campusName || (user?.email ?? '')}</Text>
          </View>
        </View>

        {/* Row 2: Month-Year selector */}
        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowMonthPicker(true)} activeOpacity={0.8}>
          <TouchableOpacity
            style={styles.monthArrow}
            onPress={() => {
              const p = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 }
              applyMonth(p.y, p.m)
            }}
          >
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
              const n = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
              applyMonth(n.y, n.m)
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
            <Text style={[styles.pillTxt, { color: '#10B981' }]}>{presentDays} Days Present</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <FontAwesome5 iconStyle="solid" name="qrcode" size={13} color="#fff" />
            <Text style={[styles.pillTxt, { color: '#fff' }]}>{totalScans} Scans</Text>
          </View>
          {noCheckOut > 0 && (
            <View style={[styles.pill, { backgroundColor: 'rgba(239,68,68,0.2)' }]}>
              <FontAwesome5 iconStyle="solid" name="exclamation-circle" size={13} color="#FCA5A5" />
              <Text style={[styles.pillTxt, { color: '#FCA5A5' }]}>{noCheckOut} No Check-out</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          <View style={{ width: TABLE_WIDTH }}>
            <TableHeader />
            <FlatList
              data={rows}
              keyExtractor={item => String(item.day)}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => { setRefreshing(true); load(year, month, true) }}
                  colors={['#6366F1']}
                  tintColor="#6366F1"
                />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <View style={styles.emptyIcon}>
                    <FontAwesome5 iconStyle="solid" name="calendar-times" size={36} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>No data</Text>
                  <Text style={styles.emptySub}>No records for {MONTH_NAMES[month - 1]} {year}</Text>
                </View>
              }
              renderItem={({ item, index }) => {
                const isEven   = index % 2 === 0
                const isWeekend = item.dow === 0 || item.dow === 6

                return (
                  <View style={[
                    styles.row,
                    isEven && styles.rowEven,
                    item.status === 'no_record' && styles.rowAbsent,
                    item.status === 'present' && !item.pairs.some(p => p.out) && styles.rowNoOut,
                    { width: TABLE_WIDTH },
                  ]}>
                    {/* # */}
                    <Text style={[styles.cell, { width: COL_NO, color: '#94A3B8', textAlign: 'center', fontWeight: '700' }]}>
                      {item.day}
                    </Text>

                    {/* Date */}
                    <View style={[styles.cellCenter, { width: COL_DATE }]}>
                      <Text style={[styles.dateDay, isWeekend && { color: '#EF4444' }]}>
                        {String(item.day).padStart(2, '0')}
                      </Text>
                      <Text style={[styles.dateMonthYear, isWeekend && { color: '#EF4444' }]}>
                        {DAY_SHORT[item.dow]} {MONTH_NAMES[month - 1]}
                      </Text>
                    </View>

                    {/* Shift period or status badge */}
                    {item.status !== 'present' ? (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_STYLE[item.status].bg }]}>
                          <Text style={[styles.statusBadgeTxt, { color: STATUS_STYLE[item.status].txt }]}>
                            {STATUS_STYLE[item.status].label}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <>
                        {/* Shift period cell */}
                        <View style={[styles.cellCenter, { width: COL_PERIOD }]}>
                          {item.period ? (
                            <View style={styles.periodPill}>
                              <Text style={styles.periodTxt} numberOfLines={1}>{item.period}</Text>
                            </View>
                          ) : (
                            <Text style={styles.timeDash}>—</Text>
                          )}
                        </View>

                        {/* Scan pair columns */}
                        {Array.from({ length: MAX_PAIRS }, (_, p) => {
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
                      </>
                    )}
                  </View>
                )
              }}
            />
          </View>
        </ScrollView>
      )}

      {/* ── Month-Year Picker Modal ─────────────────────────────────────── */}
      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerTitle}>Select Month</Text>

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

            <View style={styles.monthGrid}>
              {MONTH_NAMES.map((m, i) => {
                const mNum    = i + 1
                const isActive = mNum === month
                const isFuturM = year === now.getFullYear() && mNum > now.getMonth() + 1
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

  // Header
  header:    { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingBottom: 14, gap: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },

  // Month selector
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  monthPill:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  monthText:  { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Pills
  pillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillTxt:  { fontSize: 12, fontWeight: '700' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Table
  tableHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E2E8F0', paddingVertical: 10, borderBottomWidth: 1.5, borderBottomColor: '#CBD5E1' },
  th: { fontSize: 11, fontWeight: '700', color: '#64748B', textAlign: 'center' },

  row:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowEven:   { backgroundColor: '#F8FAFC' },
  rowAbsent: { backgroundColor: '#FFFBEB' },
  rowNoOut:  { backgroundColor: '#FFF5F5' },

  cell:       { fontSize: 12 },
  cellCenter: { alignItems: 'center', justifyContent: 'center' },

  dateDay:       { fontSize: 15, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  dateMonthYear: { fontSize: 10, color: '#94A3B8', fontWeight: '500', textAlign: 'center' },

  periodPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, maxWidth: COL_PERIOD - 8 },
  periodTxt:  { fontSize: 10, fontWeight: '700', color: '#6366F1', textAlign: 'center' },

  timePill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 7 },
  timeTxt:  { fontSize: 10, fontWeight: '700' },
  timeDash: { fontSize: 14, color: '#E2E8F0', fontWeight: '500' },

  statusBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeTxt: { fontSize: 11, fontWeight: '700' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
  emptySub:   { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 32 },

  // Month picker modal
  pickerOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  pickerCard:     { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', gap: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  pickerTitle:    { fontSize: 17, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  pickerYearRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  pickerArrow:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  pickerYear:     { fontSize: 22, fontWeight: '800', color: '#1E293B', minWidth: 60, textAlign: 'center' },
  monthGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  monthCell:      { width: '30%', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  monthCellActive:   { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  monthCellDisabled: { opacity: 0.35 },
  monthCellTxt:          { fontSize: 14, fontWeight: '600', color: '#475569' },
  monthCellTxtActive:    { color: '#fff', fontWeight: '800' },
  monthCellTxtDisabled:  { color: '#CBD5E1' },
  pickerClose:    { paddingVertical: 13, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  pickerCloseTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
})
