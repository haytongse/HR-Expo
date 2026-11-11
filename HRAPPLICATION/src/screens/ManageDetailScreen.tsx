import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, RefreshControl, StatusBar, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Image, TextInput, Dimensions,
} from 'react-native'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useAdminViewModel } from '../viewmodels/useAdminViewModel'
import AppButton from '../components/AppButton'
import AppInput from '../components/AppInput'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { User, TimeTable, ShiftSchedule, PublicHoliday, UserPermission } from '../models'
import { LeaveType, Announcement, adminService } from '../services/adminService'
import { SERVER_URL } from '../services/api'
import { AppAlert, useAlert } from '../components/AppAlert'
import DateTimePicker from '@react-native-community/datetimepicker'
import DocumentPicker from 'react-native-document-picker'
import { exportToExcel, importFromExcel, campusTemplate, userTemplate } from '../utils/excelUtils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`
}

// ─── Coming Soon Placeholder ─────────────────────────────────────────────────
function ComingSoon({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={ph.wrap}>
      <View style={ph.iconWrap}>
        <FontAwesome5 iconStyle="solid" name={icon} size={40} color="#6366F1" />
      </View>
      <Text style={ph.title}>{title}</Text>
      <Text style={ph.sub}>This section is coming soon.</Text>
    </View>
  )
}
const ph = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  sub: { fontSize: 14, color: '#94A3B8' },
})

// ─── Campuses Section ─────────────────────────────────────────────────────────
function CampusesSection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const { campuses, isLoading, loadCampuses, createCampus, updateCampus, deleteCampus, addCampusWifi, deleteCampusWifi } = useAdminViewModel()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal]           = useState(false)
  const [editCampusId, setEditCampusId] = useState<number | null>(null)
  const [wifiInput, setWifiInput]   = useState('')
  const [wifiList, setWifiList]     = useState<string[]>([])
  const [code, setCode]             = useState('')
  const [publicId, setPublicId]     = useState('')
  const [fullName, setFullName]     = useState('')
  const [address, setAddress]       = useState('')
  const [phone, setPhone]           = useState('')
  const [email, setEmail]           = useState('')
  const [website, setWebsite]       = useState('')
  const [description, setDescription] = useState('')
  const [allowMeter, setAllowMeter] = useState('')
  const [lat, setLat]               = useState('')
  const [long, setLong]             = useState('')
  const [isActive, setIsActive]     = useState(true)
  const [exporting, setExporting]   = useState(false)
  const [importing, setImporting]   = useState(false)

  const { showAlert, alertProps } = useAlert()
  const [checkInCampusIds, setCheckInCampusIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadCampuses()
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const prevY = m === 1 ? y - 1 : y
    const prevM = m === 1 ? 12 : m - 1
    Promise.all([
      adminService.getMonthlyCheckIns(y, m),
      adminService.getMonthlyCheckIns(prevY, prevM),
    ]).then(([curr, prev]) => {
      const all = [...(Array.isArray(curr) ? curr : []), ...(Array.isArray(prev) ? prev : [])]
      const ids = new Set<number>(all.map((r: any) => Number(r.user?.campusId ?? r.user?.campus_id ?? 0)).filter(Boolean))
      setCheckInCampusIds(ids)
    }).catch(() => {})
  }, [])
  useEffect(() => { onRegisterAdd?.(() => { setEditCampusId(null); resetForm(); setModal(true) }) }, [onRegisterAdd])

  const resetForm = () => {
    setCode(''); setPublicId(''); setFullName(''); setAddress(''); setPhone('')
    setEmail(''); setWebsite(''); setDescription(''); setAllowMeter(''); setLat(''); setLong('')
    setIsActive(true); setWifiInput(''); setWifiList([])
  }

  const openEdit = (item: typeof campuses[0]) => {
    setEditCampusId(item.id)
    setWifiList([]); setWifiInput('')
    setCode(item.code)
    setPublicId(item.publicId ?? '')
    setFullName(item.fullName)
    setAddress(item.address ?? '')
    setPhone(item.phoneNumber ?? '')
    setEmail(item.email ?? '')
    setWebsite(item.website ?? '')
    setDescription(item.description ?? '')
    setAllowMeter(item.allowMeter != null ? String(item.allowMeter) : '')
    setLat(item.lat != null ? String(item.lat) : '')
    setLong(item.long != null ? String(item.long) : '')
    setIsActive(item.status === 1)
    setModal(true)
  }

  const campusPayload = () => ({
    code: code.trim(), publicId: publicId.trim() || null, fullName: fullName.trim(),
    address: address.trim() || null, phoneNumber: phone.trim() || null,
    email: email.trim() || null, website: website.trim() || null,
    description: description.trim() || null, status: isActive ? 1 : 0,
    allowMeter: allowMeter ? Number(allowMeter) : null,
    lat: lat ? Number(lat) : null, long: long ? Number(long) : null,
  })

  const onCreate = async () => {
    if (!code.trim() || !fullName.trim()) {
      showAlert({ title: 'Missing Fields', message: 'Code and Full Name are required', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    const isEdit = editCampusId != null
    if (isEdit) {
      showConfirm({
        title: 'Update Campus', message: `Save changes to "${fullName.trim()}"?`,
        icon: 'building', iconColor: '#6366F1', iconBg: '#EEF2FF',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: async () => {
            setModal(false)
            try {
              await updateCampus(editCampusId!, campusPayload())
              for (const name of wifiList) {
                await addCampusWifi(editCampusId!, name.trim())
              }
              setEditCampusId(null); resetForm()
            } catch (e: any) {
              showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
            }
          }},
        ],
      })
    } else {
      showConfirm({
        title: 'Create Campus', message: `Create campus "${fullName.trim()}"?`,
        icon: 'building', iconColor: '#6366F1', iconBg: '#EEF2FF',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create', onPress: async () => {
            try {
              const newCampus = await createCampus(campusPayload())
              if (newCampus?.id) {
                for (const name of wifiList) {
                  await addCampusWifi(newCampus.id, name.trim())
                }
              }
              setModal(false); setEditCampusId(null); resetForm()
            } catch (e: any) {
              showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
            }
          }},
        ],
      })
    }
  }

  const handleExport = async () => {
    if (campuses.length === 0) { showAlert({ title: 'No Data', message: 'No campuses to export.', icon: 'information-circle-outline', iconColor: '#F59E0B', iconBg: '#FEF3C7', buttons: [{ text: 'OK' }] }); return }
    setExporting(true)
    try {
      const rows = campuses.map(c => ({
        ID: c.id, Code: c.code, 'Public ID': c.publicId ?? '', 'Full Name': c.fullName,
        Address: c.address ?? '', 'Phone Number': c.phoneNumber ?? '', Email: c.email ?? '',
        Website: c.website ?? '', Description: c.description ?? '',
        'Allow Meter (m)': c.allowMeter ?? '', Latitude: c.lat ?? '', Longitude: c.long ?? '',
        'Status (1=Active/0=Inactive)': c.status,
      }))
      await exportToExcel(rows, `Campuses_${Date.now()}`, 'Campuses')
    } catch (e: any) {
      showAlert({ title: 'Export Failed', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
    } finally { setExporting(false) }
  }

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls] })
      setImporting(true)
      const filePath = result.uri.replace('file://', '')
      const rows = await importFromExcel(filePath)
      let created = 0
      for (const row of rows) {
        const rowCode = String(row['Code'] ?? row['code'] ?? '').trim()
        const rowName = String(row['Full Name'] ?? row['fullName'] ?? '').trim()
        if (!rowCode || !rowName) continue
        try { await createCampus({ code: rowCode, fullName: rowName, address: row['Address'] ?? null, phoneNumber: row['Phone'] ?? null, email: row['Email'] ?? null }); created++ } catch {}
      }
      await loadCampuses()
      showAlert({ title: 'Import Done', message: `${created} campus(es) imported successfully.`, icon: 'check-circle', iconColor: '#10B981', iconBg: '#D1FAE5', buttons: [{ text: 'OK' }] })
    } catch (e: any) {
      if (!DocumentPicker.isCancel(e)) showAlert({ title: 'Import Failed', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
    } finally { setImporting(false) }
  }

  const handleDownloadTemplate = async () => {
    try { await exportToExcel(campusTemplate(), 'Campuses_Template', 'Campuses') }
    catch (e: any) { showAlert({ title: 'Error', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] }) }
  }

  const onDelete = (id: number, name: string) => {
    showConfirm({
      title: 'Delete Campus', message: `Delete "${name}"? This cannot be undone.`,
      icon: 'trash-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: async () => {
          try {
            await deleteCampus(id)
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{campuses.length} campuses</Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.excelBtn} onPress={handleDownloadTemplate}>
            <FontAwesome5 iconStyle="solid" name="file" size={15} color="#10B981" />
            <Text style={[s.excelBtnTxt, { color: '#10B981' }]}>Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.excelBtn} onPress={handleImport} disabled={importing}>
            {importing ? <ActivityIndicator size="small" color="#F59E0B" /> : <FontAwesome5 iconStyle="solid" name="cloud-upload-alt" size={15} color="#F59E0B" />}
            <Text style={[s.excelBtnTxt, { color: '#F59E0B' }]}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.excelBtn} onPress={handleExport} disabled={exporting}>
            {exporting ? <ActivityIndicator size="small" color="#6366F1" /> : <FontAwesome5 iconStyle="solid" name="cloud-download-alt" size={15} color="#6366F1" />}
            <Text style={[s.excelBtnTxt, { color: '#6366F1' }]}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={campuses}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadCampuses} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No campuses found</Text>}
        renderItem={({ item }) => {
          const hasCheckIns = checkInCampusIds.has(item.id)
          return (
          <View style={s.listItem}>
            <View style={s.rowItem}>
              <View style={[s.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome5 iconStyle="solid" name="building" size={22} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{item.fullName}
                  <Text style={[s.itemSub, { fontWeight: '500' }]}> · {item.code}</Text>
                </Text>
                <Text style={s.itemSub} numberOfLines={1}>{item.address || '—'}</Text>
                <View style={s.campusInfoRow}>
                  {item.allowMeter != null && (
                    <View style={s.campusInfoChip}>
                      <FontAwesome5 iconStyle="solid" name="dot-circle" size={10} color="#6366F1" />
                      <Text style={s.campusInfoTxt}>{item.allowMeter}m</Text>
                    </View>
                  )}
                  {item.wifis?.length > 0 && (
                    <View style={s.campusInfoChip}>
                      <FontAwesome5 iconStyle="solid" name="wifi" size={10} color="#10B981" />
                      <Text style={[s.campusInfoTxt, { color: '#10B981' }]} numberOfLines={1}>
                        {item.wifis.map(w => w.wifiName).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={[s.pill, { backgroundColor: item.status === 1 ? '#D1FAE5' : '#F1F5F9' }]}>
                  <Text style={[s.pillTxt, { color: item.status === 1 ? '#10B981' : '#94A3B8' }]}>
                    {item.status === 1 ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>
            {/* Action row */}
            <View style={s.userItemActions}>
              <TouchableOpacity style={s.userItemBtn} onPress={() => openEdit(item)}>
                <FontAwesome5 iconStyle="solid" name="edit" size={14} color="#6366F1" />
                <Text style={[s.userItemBtnTxt, { color: '#6366F1' }]}>Edit</Text>
              </TouchableOpacity>
              <View style={s.userItemDivider} />
              <TouchableOpacity
                style={[s.userItemBtn, hasCheckIns && { opacity: 0.35 }]}
                onPress={() => onDelete(item.id, item.fullName)}
                disabled={hasCheckIns}
              >
                <FontAwesome5 iconStyle="solid" name="trash-alt" size={14} color="#EF4444" />
                <Text style={[s.userItemBtnTxt, { color: '#EF4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          )
        }}
      />

      {/* Create / Edit Campus Modal */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => { setModal(false); setEditCampusId(null); resetForm() }}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={[s.sheet, { maxHeight: '90%' }]}>
            <View style={s.sheetHeaderRow}>
              <Text style={s.sheetTitle}>{editCampusId != null ? 'Edit Campus' : 'New Campus'}</Text>
              <TouchableOpacity onPress={() => { setModal(false); resetForm() }} style={s.sheetCloseBtn}>
                <FontAwesome5 iconStyle="solid" name="times" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <AppInput label="Code *" placeholder="e.g. HQ" value={code} onChangeText={setCode} leftIcon="barcode-outline" />
              <AppInput label="Full Name *" placeholder="Campus full name" value={fullName} onChangeText={setFullName} leftIcon="building" />
              <AppInput label="Public ID" placeholder="Unique public identifier (optional)" value={publicId} onChangeText={setPublicId} leftIcon="finger-print-outline" />
              <AppInput label="Address" placeholder="Street address" value={address} onChangeText={setAddress} leftIcon="map-marker-alt" />
              <AppInput label="Phone Number" placeholder="+855 xx xxx xxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="phone" />
              <AppInput label="Email" placeholder="campus@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="envelope" />
              <AppInput label="Website" placeholder="https://example.com" value={website} onChangeText={setWebsite} keyboardType="url" autoCapitalize="none" leftIcon="globe-outline" />
              <AppInput label="Description" placeholder="Optional description" value={description} onChangeText={setDescription} leftIcon="file-alt" />
              <AppInput label="Allow Radius (meters)" placeholder="e.g. 100" value={allowMeter} onChangeText={setAllowMeter} keyboardType="numeric" leftIcon="dot-circle" />
              <AppInput label="Latitude" placeholder="e.g. 11.5564" value={lat} onChangeText={setLat} keyboardType="decimal-pad" leftIcon="location-arrow" />
              <AppInput label="Longitude" placeholder="e.g. 104.9282" value={long} onChangeText={setLong} keyboardType="decimal-pad" leftIcon="location-arrow" />
              {/* Status Toggle */}
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Status</Text>
                  <Text style={s.toggleSub}>{isActive ? 'Active' : 'Inactive'}</Text>
                </View>
                <TouchableOpacity
                  style={[s.toggleTrack, isActive && s.toggleTrackOn]}
                  onPress={() => setIsActive(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[s.toggleThumb, isActive && s.toggleThumbOn]} />
                </TouchableOpacity>
              </View>
              {/* WiFi Names */}
              <Text style={s.formSection}>WiFi Networks</Text>
              <View style={s.wifiInputRow}>
                <View style={{ flex: 1 }}>
                  <AppInput label="" placeholder="WiFi name (SSID)" value={wifiInput} onChangeText={setWifiInput} leftIcon="wifi" />
                </View>
                <TouchableOpacity
                  style={s.wifiAddBtn}
                  onPress={() => {
                    const name = wifiInput.trim()
                    if (name && !wifiList.includes(name)) {
                      setWifiList(prev => [...prev, name])
                    }
                    setWifiInput('')
                  }}
                >
                  <FontAwesome5 iconStyle="solid" name="plus" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {/* Pending new wifis */}
              {wifiList.map((w, i) => (
                <View key={i} style={s.wifiChip}>
                  <FontAwesome5 iconStyle="solid" name="wifi" size={13} color="#10B981" />
                  <Text style={s.wifiChipTxt}>{w}</Text>
                  <TouchableOpacity onPress={() => setWifiList(prev => prev.filter((_, idx) => idx !== i))}>
                    <FontAwesome5 iconStyle="solid" name="times-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ))}
              {/* Existing wifis (edit mode only) */}
              {editCampusId != null && (campuses.find(c => c.id === editCampusId)?.wifis ?? []).map(w => (
                <View key={w.id} style={[s.wifiChip, { backgroundColor: '#EEF2FF' }]}>
                  <FontAwesome5 iconStyle="solid" name="wifi" size={13} color="#6366F1" />
                  <Text style={[s.wifiChipTxt, { color: '#6366F1', flex: 1 }]}>{w.wifiName}</Text>
                  <TouchableOpacity onPress={async () => {
                    try { await deleteCampusWifi(editCampusId, w.id) }
                    catch (e: any) { showAlert({ title: 'Error', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] }) }
                  }}>
                    <FontAwesome5 iconStyle="solid" name="trash-alt" size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <View style={{ height: 16 }} />
              <AppButton title={editCampusId != null ? 'Save Changes' : 'Create Campus'} onPress={onCreate} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
              <AppButton title="Cancel" variant="danger" onPress={() => { setModal(false); setEditCampusId(null); resetForm() }} fullWidth />
              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
      <AppAlert {...alertProps} />
    </>
  )
}

// ─── Users Section ────────────────────────────────────────────────────────────
function UsersSection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const { users, isLoading, loadUsers, createUser, updateUser, deleteUser, campuses, loadCampuses, shifts, loadShifts, assignUserToShift } = useAdminViewModel()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal]                   = useState(false)
  const [fullName, setFullName]             = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole]                     = useState<'user' | 'admin'>('user')
  const [phone, setPhone]                   = useState('')
  const [address, setAddress]               = useState('')
  const [birthDate, setBirthDate]           = useState<Date | null>(null)
  const [tempBirthDate, setTempBirthDate]   = useState<Date>(new Date(2000, 0, 1))
  const [showDOBPicker, setShowDOBPicker]   = useState(false)
  const [campusId, setCampusId]             = useState<number | null>(null)
  const [userCode, setUserCode]             = useState('')
  const [isActive, setIsActive]             = useState(true)
  const [allowWifi, setAllowWifi]           = useState(false)
  const [noCheckOut, setNoCheckOut]         = useState(false)
  const [allowOutside, setAllowOutside]     = useState(false)
  const [showDropdown, setShowDropdown]     = useState(false)
  const [exporting, setExporting]           = useState(false)
  const [importing, setImporting]           = useState(false)

  // edit mode: holds the user being edited (null = create mode)
  const [editingUser, setEditingUser]       = useState<User | null>(null)

  // Assign shift modal state
  const [assignModal, setAssignModal]       = useState(false)
  const [assignItem, setAssignItem]         = useState<User | null>(null)
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null)

  const { showAlert, alertProps } = useAlert()
  const [checkInUserIds, setCheckInUserIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadUsers(); loadCampuses(); loadShifts()
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth() + 1
    const prevY = m === 1 ? y - 1 : y
    const prevM = m === 1 ? 12 : m - 1
    Promise.all([
      adminService.getMonthlyCheckIns(y, m),
      adminService.getMonthlyCheckIns(prevY, prevM),
    ]).then(([curr, prev]) => {
      const all = [...(Array.isArray(curr) ? curr : []), ...(Array.isArray(prev) ? prev : [])]
      const ids = new Set<number>(all.map((r: any) => Number(r.userId ?? r.user_id)).filter(Boolean))
      setCheckInUserIds(ids)
    }).catch(() => {})
  }, [])
  useEffect(() => { onRegisterAdd?.(() => { setEditingUser(null); resetForm(); setModal(true) }) }, [onRegisterAdd])

  const resetForm = () => {
    setFullName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setRole('user')
    setPhone(''); setAddress(''); setBirthDate(null); setShowDOBPicker(false); setCampusId(null)
    setUserCode(''); setIsActive(true); setAllowWifi(false)
    setNoCheckOut(false); setAllowOutside(false); setShowDropdown(false)
  }

  const err = (msg: string) => showAlert({ title: 'Error', message: msg, icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })

  const onSubmit = async () => {
    if (editingUser) {
      // ── Edit mode ──────────────────────────────────────────────────────────
      showConfirm({
        title: 'Update User', message: `Save changes to "${editingUser.fullName || editingUser.email}"?`,
        icon: 'user', iconColor: '#6366F1', iconBg: '#EEF2FF',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: async () => {
            try {
              await updateUser(editingUser.id, {
                fullName: fullName.trim() || undefined,
                email: email.trim(),
                role,
                phoneNumber: phone.trim() || undefined,
                address: address.trim() || undefined,
                password: password.trim() || undefined,
                birthOfDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
                status: isActive ? '1' : '0',
                campusId: campusId ?? null,
                userCode: userCode.trim() || undefined,
                allowWifi,
                noCheckOut,
                allowOutside,
              })
              setModal(false)
              setEditingUser(null); resetForm()
            } catch (e: any) { err(e?.response?.data?.message || e.message) }
          }},
        ],
      })
    } else {
      // ── Create mode ────────────────────────────────────────────────────────
      if (!email || !password) { err('Email and password are required'); return }
      if (password.length < 8) { err('Password must be at least 8 characters'); return }
      if (password !== confirmPassword) { err('Passwords do not match'); return }
      showConfirm({
        title: 'Create User', message: `Create account for "${fullName.trim() || email.trim()}"?`,
        icon: 'user', iconColor: '#10B981', iconBg: '#D1FAE5',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create', onPress: async () => {
            try {
              await createUser({ fullName: fullName.trim() || undefined, email: email.trim(), password, role, phoneNumber: phone.trim() || undefined, address: address.trim() || undefined, birthOfDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined, campusId: campusId ?? undefined, status: isActive ? '1' : '0', userCode: userCode.trim() || undefined, allowWifi, noCheckOut, allowOutside })
              setModal(false); resetForm()
            } catch (e: any) { err(e?.response?.data?.message || e.message) }
          }},
        ],
      })
    }
  }

  const onDelete = (id: number, name: string) =>
    showAlert({
      title: 'Delete User', message: `Remove "${name || 'this user'}"? This cannot be undone.`,
      icon: 'trash-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteUser(id) },
      ],
    })

  const onEdit = (user: User) => {
    setEditingUser(user)
    setFullName(user.fullName || '')
    setEmail(user.email)
    setRole(user.role)
    setPhone(user.phoneNumber || '')
    setAddress(user.address || '')
    setPassword('')
    setConfirmPassword('')
    setUserCode(user.userCode || '')
    setCampusId(user.campusId ? Number(user.campusId) : null)
    setIsActive(!user.status || user.status === '1' || user.status === 'active')
    setAllowWifi(user.allowWifi ?? false)
    setNoCheckOut(user.noCheckOut ?? false)
    setAllowOutside(user.allowOutside ?? false)
    setBirthDate(user.birthOfDate ? new Date(user.birthOfDate) : null)
    setShowDropdown(false)
    setShowDOBPicker(false)
    setModal(true)
  }

  const onAssign = (user: User) => {
    console.log('[Assign] shifts available:', shifts.length, shifts.map(s => s.id + ':' + s.name))
    setAssignItem(user)
    setSelectedShiftId(user.shiftSchedule?.id ?? null)
    setAssignModal(true)
  }

  const handleAssign = () => {
    if (!assignItem || !selectedShiftId) return
    showConfirm({
      title: 'Assign Shift',
      message: `Assign shift to "${assignItem.fullName || assignItem.email}"?`,
      icon: 'layer-group',
      iconColor: '#8B5CF6',
      iconBg: '#EDE9FE',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Assign', onPress: async () => {
          try {
            await assignUserToShift(selectedShiftId, assignItem.id)
            await loadUsers()
            setAssignModal(false)
          } catch (e: any) { err(e?.response?.data?.message || e.message) }
        }},
      ],
    })
  }

  const handleExport = async () => {
    if (users.length === 0) { showAlert({ title: 'No Data', message: 'No users to export.', icon: 'information-circle-outline', iconColor: '#F59E0B', iconBg: '#FEF3C7', buttons: [{ text: 'OK' }] }); return }
    setExporting(true)
    try {
      const rows = users.map(u => ({
        ID: u.id, 'User Code': u.userCode ?? '', 'Full Name': u.fullName ?? '',
        Email: u.email, Role: u.role, Status: u.status ?? 'active',
        'Phone Number': u.phoneNumber ?? '', Address: u.address ?? '',
        'Birth Date': u.birthOfDate ?? '', 'Campus ID': u.campusId ?? '',
        'Allow WiFi': u.allowWifi ? 'true' : 'false',
        'No Check Out': u.noCheckOut ? 'true' : 'false',
        'Allow Outside': u.allowOutside ? 'true' : 'false',
      }))
      await exportToExcel(rows, `Users_${Date.now()}`, 'Users')
    } catch (e: any) { showAlert({ title: 'Export Failed', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] }) }
    finally { setExporting(false) }
  }

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls] })
      setImporting(true)
      const filePath = result.uri.replace('file://', '')
      const rows = await importFromExcel(filePath)
      let created = 0
      for (const row of rows) {
        const userEmail = String(row['Email'] ?? row['email'] ?? '').trim()
        const userPassword = String(row['Password'] ?? row['password'] ?? '').trim()
        if (!userEmail || !userPassword) continue
        try { await createUser({ fullName: row['Full Name'] ?? '', email: userEmail, password: userPassword, role: (row['Role'] ?? 'user').toLowerCase() }); created++ } catch {}
      }
      await loadUsers()
      showAlert({ title: 'Import Done', message: `${created} user(s) imported successfully.`, icon: 'check-circle', iconColor: '#10B981', iconBg: '#D1FAE5', buttons: [{ text: 'OK' }] })
    } catch (e: any) {
      if (!DocumentPicker.isCancel(e)) showAlert({ title: 'Import Failed', message: e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
    } finally { setImporting(false) }
  }

  const handleDownloadTemplate = async () => {
    try { await exportToExcel(userTemplate(), 'Users_Template', 'Users') }
    catch (e: any) { err(e.message) }
  }

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{users.length} users</Text>
        <View style={s.actionRow}>
          <TouchableOpacity style={s.excelBtn} onPress={handleDownloadTemplate}>
            <FontAwesome5 iconStyle="solid" name="file" size={15} color="#10B981" />
            <Text style={[s.excelBtnTxt, { color: '#10B981' }]}>Template</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.excelBtn} onPress={handleImport} disabled={importing}>
            {importing ? <ActivityIndicator size="small" color="#F59E0B" /> : <FontAwesome5 iconStyle="solid" name="cloud-upload-alt" size={15} color="#F59E0B" />}
            <Text style={[s.excelBtnTxt, { color: '#F59E0B' }]}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.excelBtn} onPress={handleExport} disabled={exporting}>
            {exporting ? <ActivityIndicator size="small" color="#6366F1" /> : <FontAwesome5 iconStyle="solid" name="cloud-download-alt" size={15} color="#6366F1" />}
            <Text style={[s.excelBtnTxt, { color: '#6366F1' }]}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUsers} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No users found</Text>}
        renderItem={({ item }: { item: User }) => {
          const active = !item.status || item.status === '1' || item.status === 'active'
          const hasCheckIns = checkInUserIds.has(item.id)
          return (
            <View style={s.listItem}>
              <View style={s.rowItem}>
                <View style={[s.ava, item.role === 'admin' && { backgroundColor: '#8B5CF6' }]}>
                  <Text style={s.avaTxt}>{item.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle} numberOfLines={1}>{item.fullName || item.email}</Text>
                  <Text style={s.itemSub} numberOfLines={1}>{item.email}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <View style={[s.pill, { backgroundColor: item.role === 'admin' ? '#EEF2FF' : '#D1FAE5' }]}>
                      <Text style={[s.pillTxt, { color: item.role === 'admin' ? '#6366F1' : '#10B981' }]}>
                        {item.role === 'admin' ? 'Admin' : 'Employee'}
                      </Text>
                    </View>
                    <View style={[s.pill, { backgroundColor: active ? '#D1FAE5' : '#FEE2E2' }]}>
                      <Text style={[s.pillTxt, { color: active ? '#10B981' : '#EF4444' }]}>
                        {active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                    {item.shiftSchedule && (
                      <View style={[s.pill, { backgroundColor: '#F3F0FF' }]}>
                        <Text style={[s.pillTxt, { color: '#8B5CF6' }]}>{item.shiftSchedule.name || `Shift #${item.shiftSchedule.id}`}</Text>
                      </View>
                    )}
                    {item.campusId ? (
                      <View style={[s.pill, { backgroundColor: '#FFFBEB' }]}>
                        <Text style={[s.pillTxt, { color: '#D97706' }]} numberOfLines={1}>
                          {campuses.find(c => c.id === Number(item.campusId))?.fullName ?? `Campus ${item.campusId}`}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
              {/* Action row */}
              <View style={s.userItemActions}>
                <TouchableOpacity style={s.userItemBtn} onPress={() => onEdit(item)}>
                  <FontAwesome5 iconStyle="solid" name="edit" size={14} color="#6366F1" />
                  <Text style={[s.userItemBtnTxt, { color: '#6366F1' }]}>Edit</Text>
                </TouchableOpacity>
                <View style={s.userItemDivider} />
                <TouchableOpacity style={s.userItemBtn} onPress={() => onAssign(item)}>
                  <FontAwesome5 iconStyle="solid" name="calendar-alt" size={14} color="#8B5CF6" />
                  <Text style={[s.userItemBtnTxt, { color: '#8B5CF6' }]}>Assign</Text>
                </TouchableOpacity>
                <View style={s.userItemDivider} />
                <TouchableOpacity
                  style={[s.userItemBtn, hasCheckIns && { opacity: 0.35 }]}
                  onPress={() => onDelete(item.id, item.fullName || item.email)}
                  disabled={hasCheckIns}
                >
                  <FontAwesome5 iconStyle="solid" name="trash-alt" size={14} color="#EF4444" />
                  <Text style={[s.userItemBtnTxt, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
      {/* New User */}
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => { setModal(false); setEditingUser(null); resetForm() }}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={[s.sheet, { maxHeight: '92%' }]}>
            <View style={s.sheetHeaderRow}>
              <Text style={s.sheetTitle}>{editingUser ? 'Edit User' : 'New User'}</Text>
              <TouchableOpacity onPress={() => { setModal(false); setEditingUser(null); resetForm() }} style={s.sheetCloseBtn}>
                <FontAwesome5 iconStyle="solid" name="times" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Employee Info */}
              <Text style={s.formSection}>Employee Info</Text>
              <AppInput label="User Code" placeholder="e.g. EMP001" value={userCode} onChangeText={setUserCode} leftIcon="card-outline" />
              {/* Account */}
              <Text style={s.formSection}>Account</Text>
              <AppInput label="Full Name" placeholder="Full name" value={fullName} onChangeText={setFullName} leftIcon="user" />
              <AppInput label="Email *" placeholder="email@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="envelope" />
              <AppInput label={editingUser ? 'New Password' : 'Password *'} placeholder={editingUser ? 'Leave blank to keep current' : 'Min 8 characters'} value={password} onChangeText={setPassword} isPassword leftIcon="lock" />
              {!editingUser && <AppInput label="Confirm Password *" placeholder="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword leftIcon="lock" />}
              {/* Campus */}
              <Text style={s.formSection}>Campus</Text>
              <TouchableOpacity style={s.dropdownBtn} onPress={() => setShowDropdown(v => !v)}>
                <FontAwesome5 iconStyle="solid" name="building" size={18} color="#6366F1" />
                <Text style={[s.dropdownBtnTxt, !campusId && { color: '#94A3B8' }]} numberOfLines={1}>
                  {campusId ? (campuses.find(c => c.id === campusId)?.fullName ?? 'Select campus') : 'None (No campus)'}
                </Text>
                <FontAwesome5 iconStyle="solid" name={showDropdown ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
              </TouchableOpacity>
              {showDropdown && (
                <View style={s.dropdownList}>
                  <TouchableOpacity
                    style={[s.dropdownItem, campusId === null && s.dropdownItemActive]}
                    onPress={() => { setCampusId(null); setShowDropdown(false) }}
                  >
                    <Text style={[s.dropdownItemTxt, campusId === null && s.dropdownItemTxtActive]}>None</Text>
                    {campusId === null && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                  </TouchableOpacity>
                  {campuses.map(c => (
                    <TouchableOpacity
                      key={c.id}
                      style={[s.dropdownItem, campusId === c.id && s.dropdownItemActive]}
                      onPress={() => { setCampusId(c.id); setShowDropdown(false) }}
                    >
                      <Text style={[s.dropdownItemTxt, campusId === c.id && s.dropdownItemTxtActive]} numberOfLines={1}>{c.fullName}</Text>
                      {campusId === c.id && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Role */}
              <Text style={s.formSection}>Role</Text>
              <View style={s.roleRow}>
                {(['user', 'admin'] as const).map(r => (
                  <TouchableOpacity key={r} style={[s.roleBtn, role === r && s.roleBtnActive]} onPress={() => setRole(r)}>
                    <Text style={[s.roleTxt, role === r && s.roleTxtActive]}>{r === 'admin' ? 'Admin' : 'Employee'}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status */}
              <Text style={s.formSection}>Status</Text>
              <TouchableOpacity style={s.toggleRow} onPress={() => setIsActive(v => !v)}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Active Account</Text>
                  <Text style={s.toggleSub}>{isActive ? 'User can log in' : 'Account is disabled'}</Text>
                </View>
                <View style={[s.toggleTrack, isActive && s.toggleTrackGreen]}>
                  <View style={[s.toggleThumb, isActive && s.toggleThumbOn]} />
                </View>
              </TouchableOpacity>

              {/* Personal Info */}
              <Text style={s.formSection}>Personal Information</Text>
              <AppInput label="Phone Number" placeholder="+855 xx xxx xxx" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon="phone" />
              <AppInput label="Address" placeholder="Home address" value={address} onChangeText={setAddress} leftIcon="map-marker-alt" />
              <TouchableOpacity onPress={() => { setTempBirthDate(birthDate ?? new Date(2000, 0, 1)); setShowDOBPicker(true) }} style={s.dobBtn}>
                <FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color="#6366F1" />
                <Text style={[s.dobBtnTxt, !birthDate && { color: '#94A3B8' }]}>
                  {birthDate ? birthDate.toISOString().split('T')[0] : 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              {showDOBPicker && (
                <View style={s.pickerWrap}>
                  <View style={s.pickerActions}>
                    <TouchableOpacity onPress={() => setShowDOBPicker(false)}>
                      <Text style={s.pickerCancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setBirthDate(tempBirthDate); setShowDOBPicker(false) }}>
                      <Text style={s.pickerDoneTxt}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempBirthDate}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onValueChange={(_e, date) => { if (date) setTempBirthDate(date) }}
                  />
                </View>
              )}

              {/* Permissions */}
              <Text style={s.formSection}>Permissions</Text>
              <TouchableOpacity style={s.checkRow} onPress={() => setAllowWifi(v => !v)}>
                <View style={[s.checkbox, allowWifi && s.checkboxOn]}>
                  {allowWifi && <FontAwesome5 iconStyle="solid" name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Allow WiFi Bypass</Text>
                  <Text style={s.toggleSub}>User can check in without campus WiFi</Text>
                </View>
              </TouchableOpacity>
<TouchableOpacity style={s.checkRow} onPress={() => setNoCheckOut(v => !v)}>
                <View style={[s.checkbox, noCheckOut && s.checkboxOn]}>
                  {noCheckOut && <FontAwesome5 iconStyle="solid" name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>No Check In/Out</Text>
                  <Text style={s.toggleSub}>User does not need to check In/out</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={s.checkRow} onPress={() => setAllowOutside(v => !v)}>
                <View style={[s.checkbox, allowOutside && s.checkboxOn]}>
                  {allowOutside && <FontAwesome5 iconStyle="solid" name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.toggleLabel}>Allow Outside Campus</Text>
                  <Text style={s.toggleSub}>User can check in/out from outside campus area</Text>
                </View>
              </TouchableOpacity>

              <View style={{ height: 16 }} />
              <AppButton title={editingUser ? 'Save Changes' : 'Create User'} onPress={onSubmit} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
              <AppButton title="Cancel" variant="danger" onPress={() => { setModal(false); setEditingUser(null); resetForm() }} fullWidth />
              <View style={{ height: 16 }} />
            </ScrollView>
          </View>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
      {/* Assign Shift Modal */}
      <Modal visible={assignModal} transparent animationType="slide" onRequestClose={() => setAssignModal(false)}>
        <View style={s.overlay}>
          <View style={[s.sheet, { maxHeight: '70%' }]}>
            <View style={s.sheetHeaderRow}>
              <Text style={s.sheetTitle}>Assign Shift</Text>
              <TouchableOpacity onPress={() => setAssignModal(false)} style={s.sheetCloseBtn}>
                <FontAwesome5 iconStyle="solid" name="times" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            {assignItem && (
              <Text style={[s.itemSub, { marginBottom: 12 }]}>
                Assigning to: <Text style={{ fontWeight: '600', color: '#1E293B' }}>{assignItem.fullName || assignItem.email}</Text>
              </Text>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              {shifts.length === 0
                ? <Text style={s.empty}>No shifts available</Text>
                : shifts.map(shift => (
                  <TouchableOpacity
                    key={shift.id}
                    style={[s.dropdownItem, selectedShiftId === shift.id && s.dropdownItemActive]}
                    onPress={() => setSelectedShiftId(shift.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.dropdownItemTxt, selectedShiftId === shift.id && s.dropdownItemTxtActive]}>
                        {shift.name || `Shift #${shift.id}`}
                      </Text>
                      <Text style={s.itemSub}>{shift.startDate} – {shift.endDate}</Text>
                    </View>
                    {selectedShiftId === shift.id && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                  </TouchableOpacity>
                ))
              }
            </ScrollView>
            <View style={{ height: 16 }} />
            <AppButton title="Assign Shift" onPress={handleAssign} loading={isLoading} fullWidth disabled={!selectedShiftId} style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setAssignModal(false)} fullWidth />
            <View style={{ height: 16 }} />
          </View>
        </View>
      </Modal>

      <AppAlert {...alertProps} />
    </>
  )
}

// ─── Timetable Section (tabbed: Shift Schedules | Timetable) ─────────────────
type TTab = 'Shift Schedules' | 'Timetable'

function TimetableSection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const [activeTab, setActiveTab] = useState<TTab>('Shift Schedules')
  const vm = useAdminViewModel()

  useEffect(() => {
    vm.loadShifts()
    vm.loadTimetables()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Bar */}
      <View style={s.tabRow}>
        {(['Shift Schedules', 'Timetable'] as TTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabTxt, activeTab === tab && s.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Shift Schedules' ? (
        <ShiftsTab vm={vm} onRegisterAdd={onRegisterAdd} />
      ) : (
        <TimetableTab vm={vm} onRegisterAdd={onRegisterAdd} />
      )}
    </View>
  )
}

// ── Shifts Tab ────────────────────────────────────────────────────────────────
function ShiftsTab({ vm, onRegisterAdd }: { vm: ReturnType<typeof useAdminViewModel>; onRegisterAdd?: (fn: () => void) => void }) {
  const { shifts, isLoading, loadShifts, createShift, updateShift } = vm
  const { showAlert, alertProps } = useAlert()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal]             = useState(false)
  const [editItem, setEditItem]       = useState<ShiftSchedule | null>(null)
  const [name, setName]               = useState('')
  const [startDate, setStartDate]     = useState<Date | null>(null)
  const [endDate, setEndDate]         = useState<Date | null>(null)
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date())
  const [tempEndDate, setTempEndDate]     = useState<Date>(new Date())
  const [showStart, setShowStart]     = useState(false)
  const [showEnd, setShowEnd]         = useState(false)
  const [before, setBefore]           = useState('15')
  const [after, setAfter]             = useState('30')
  const [maxScans, setMaxScans]       = useState('2')

  const toDateStr = (d: Date) => d.toISOString().split('T')[0]
  const parseDate = (s: string) => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d) }

  useEffect(() => { onRegisterAdd?.(() => openCreate()) }, [onRegisterAdd])

  const openCreate = () => {
    setEditItem(null); setName(''); setStartDate(null); setEndDate(null)
    setBefore('15'); setAfter('30'); setMaxScans('2'); setModal(true)
  }

  const openEdit = (item: ShiftSchedule) => {
    setEditItem(item)
    setName(item.name ?? '')
    setStartDate(item.startDate ? parseDate(item.startDate) : null)
    setEndDate(item.endDate ? parseDate(item.endDate) : null)
    setBefore(String(item.allowTimeBefore ?? 15))
    setAfter(String(item.allowTimeAfter ?? 30))
    setMaxScans(String(item.allowAmountScan ?? 2))
    setModal(true)
  }

  const onSave = () => {
    if (!startDate || !endDate) {
      showAlert({ title: 'Error', message: 'Start and end date required', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    const data = { name: name.trim() || undefined, startDate: toDateStr(startDate), endDate: toDateStr(endDate), allowTimeBefore: Number(before), allowTimeAfter: Number(after), allowAmountScan: Number(maxScans) }
    const label = editItem ? 'Save Changes' : 'Create Shift'
    const msg = editItem
      ? `Save changes to "${editItem.name || `Shift #${editItem.id}`}"?`
      : `Create shift "${name.trim() || toDateStr(startDate)}"?`
    showConfirm({
      title: label, message: msg, icon: 'layer-group', iconColor: '#6366F1', iconBg: '#EEF2FF',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: label, onPress: async () => {
          try {
            if (editItem) { await updateShift(editItem.id, data) }
            else { await createShift(data) }
            setModal(false)
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{shifts.length} shift schedules</Text>
      </View>
      <FlatList
        data={shifts}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadShifts} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No shifts yet</Text>}
        renderItem={({ item }: { item: ShiftSchedule }) => (
          <View style={s.listItem}>
            <View style={s.rowItem}>
              <View style={[s.iconBox, { backgroundColor: '#FEF3C7' }]}>
                <FontAwesome5 iconStyle="solid" name="layer-group" size={22} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{item.name || `Shift #${item.id}`}</Text>
                <Text style={s.itemSub}>{item.startDate} → {item.endDate}</Text>
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={s.editBtn}>
                <FontAwesome5 iconStyle="solid" name="edit" size={18} color="#6366F1" />
              </TouchableOpacity>
            </View>
            <View style={s.statsRow}>
              <View style={s.statItem}><Text style={s.statN}>{item.allowAmountScan ?? '—'}</Text><Text style={s.statL}>Scans/day</Text></View>
              <View style={s.statItem}><Text style={s.statN}>{item.allowTimeBefore ?? '—'}m</Text><Text style={s.statL}>Before</Text></View>
              <View style={s.statItem}><Text style={s.statN}>{item.allowTimeAfter ?? '—'}m</Text><Text style={s.statL}>After</Text></View>
            </View>
          </View>
        )}
      />
      <AppAlert {...alertProps} />
      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <ScrollView style={s.sheet} keyboardShouldPersistTaps="handled">
            <View style={s.sheetHeaderRow}>
              <Text style={s.sheetTitle}>{editItem ? 'Edit Shift' : 'New Shift Schedule'}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={s.sheetCloseBtn}>
                <FontAwesome5 iconStyle="solid" name="times" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <AppInput label="Name" placeholder="e.g. Morning Shift" value={name} onChangeText={setName} leftIcon="bookmark-outline" />
            <TouchableOpacity style={s.dobBtn} onPress={() => { setTempStartDate(startDate ?? new Date()); setShowStart(true) }}>
              <FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color="#6366F1" />
              <Text style={[s.dobBtnTxt, !startDate && { color: '#94A3B8' }]}>{startDate ? toDateStr(startDate) : 'Start Date'}</Text>
            </TouchableOpacity>
            {showStart && (
              <View style={s.pickerWrap}>
                <View style={s.pickerActions}>
                  <TouchableOpacity onPress={() => setShowStart(false)}><Text style={s.pickerCancelTxt}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setStartDate(tempStartDate); setShowStart(false) }}><Text style={s.pickerDoneTxt}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempStartDate} mode="date" display="spinner" onValueChange={(_e, d) => { if (d) setTempStartDate(d) }} />
              </View>
            )}
            <TouchableOpacity style={s.dobBtn} onPress={() => { setTempEndDate(endDate ?? new Date()); setShowEnd(true) }}>
              <FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color="#6366F1" />
              <Text style={[s.dobBtnTxt, !endDate && { color: '#94A3B8' }]}>{endDate ? toDateStr(endDate) : 'End Date'}</Text>
            </TouchableOpacity>
            {showEnd && (
              <View style={s.pickerWrap}>
                <View style={s.pickerActions}>
                  <TouchableOpacity onPress={() => setShowEnd(false)}><Text style={s.pickerCancelTxt}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEndDate(tempEndDate); setShowEnd(false) }}><Text style={s.pickerDoneTxt}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempEndDate} mode="date" display="spinner" minimumDate={startDate ?? undefined} onValueChange={(_e, d) => { if (d) setTempEndDate(d) }} />
              </View>
            )}
            <AppInput label="Allow Before (min)" placeholder="15" value={before} onChangeText={setBefore} keyboardType="numeric" leftIcon="clock" />
            <AppInput label="Allow After (min)" placeholder="30" value={after} onChangeText={setAfter} keyboardType="numeric" leftIcon="clock" />
            <AppInput label="Max Scans/Day" placeholder="2" value={maxScans} onChangeText={setMaxScans} keyboardType="numeric" leftIcon="qrcode" />
            <AppButton title={editItem ? 'Save Changes' : 'Create Shift'} onPress={onSave} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setModal(false)} fullWidth />
            <View style={{ height: 16 }} />
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
    </>
  )
}

// ── Timetable Tab ─────────────────────────────────────────────────────────────
function TimetableTab({ vm, onRegisterAdd }: { vm: ReturnType<typeof useAdminViewModel>; onRegisterAdd?: (fn: () => void) => void }) {
  const { timetables, shifts, isLoading, loadTimetables, createTimetable, updateTimetable } = vm
  const { showAlert, alertProps } = useAlert()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem]         = useState<TimeTable | null>(null)
  const [shiftId, setShiftId]           = useState('')
  const [showShiftDrop, setShowShiftDrop] = useState(false)
  const [day, setDay]                   = useState(1)
  const [label, setLabel]               = useState('')
  const [start, setStart]               = useState<Date>(new Date(2000, 0, 1, 8, 0))
  const [end, setEnd]                   = useState<Date>(new Date(2000, 0, 1, 17, 0))
  const [tempStart, setTempStart]       = useState<Date>(new Date(2000, 0, 1, 8, 0))
  const [tempEnd, setTempEnd]           = useState<Date>(new Date(2000, 0, 1, 17, 0))
  const [showStart, setShowStart]       = useState(false)
  const [showEnd, setShowEnd]           = useState(false)

  const toTimeStr = (d: Date) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  const parseTime = (t: string) => { const [h, m] = t.split(':').map(Number); return new Date(2000, 0, 1, h, m) }

  useEffect(() => { onRegisterAdd?.(() => { setEditItem(null); setShiftId(''); setLabel(''); setDay(1); setModal(true) }) }, [onRegisterAdd])

  const openEdit = (item: TimeTable) => {
    setEditItem(item)
    setShiftId(String(item.shiftScheduleId ?? ''))
    setLabel(item.label)
    setDay(item.dayOfWeek)
    if (item.startTime) { const d = parseTime(item.startTime); setStart(d); setTempStart(d) }
    if (item.endTime)   { const d = parseTime(item.endTime);   setEnd(d);   setTempEnd(d) }
    setModal(true)
  }

  const onSave = () => {
    if (!shiftId || !label) {
      showAlert({ title: 'Error', message: 'Fill all required fields', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    const data = { shiftScheduleId: Number(shiftId), dayOfWeek: day, label, startTime: toTimeStr(start), endTime: toTimeStr(end) }
    const isEdit = editItem != null
    const selectedShift = shifts.find(sh => String(sh.id) === shiftId)
    const confirmTitle = isEdit ? 'Save Changes' : 'Create Timetable'
    const confirmMsg = isEdit
      ? `Save changes to "${editItem.label}"?`
      : `Create "${label}" for ${selectedShift?.name || `Shift #${shiftId}`}?`
    showConfirm({
      title: confirmTitle, message: confirmMsg, icon: 'clock', iconColor: '#8B5CF6', iconBg: '#F3E8FF',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: isEdit ? 'Save' : 'Create', onPress: async () => {
          try {
            if (isEdit) { await updateTimetable(editItem.id, data) }
            else { await createTimetable(data) }
            setModal(false); setLabel(''); setShiftId(''); setEditItem(null)
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{timetables.length} timetables</Text>
      </View>
      <FlatList
        data={timetables}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadTimetables} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No timetables yet</Text>}
        renderItem={({ item }: { item: TimeTable }) => {
          const shift = shifts.find(sh => sh.id === item.shiftScheduleId)
          return (
            <View style={s.listItem}>
              <View style={s.rowItem}>
                <View style={[s.iconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#8B5CF6' }}>{DAYS[item.dayOfWeek]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.itemTitle}>{item.label}</Text>
                  <Text style={s.itemSub}>{item.startTime} – {item.endTime}</Text>
                  {shift && <Text style={[s.itemSub, { color: '#8B5CF6' }]}>{shift.name || `Shift #${shift.id}`}</Text>}
                </View>
                <TouchableOpacity onPress={() => openEdit(item)} style={s.editBtn}>
                  <FontAwesome5 iconStyle="solid" name="edit" size={18} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
      <AppAlert {...alertProps} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <ScrollView style={s.sheet} keyboardShouldPersistTaps="handled">
            <Text style={[s.sheetTitle, { marginBottom: 16 }]}>{editItem ? 'Edit Timetable' : 'New Timetable'}</Text>
            {/* Shift Schedule Dropdown */}
            <Text style={s.dayLabel}>Shift Schedule</Text>
            {shifts.length === 0
              ? <Text style={[s.itemSub, { marginBottom: 12 }]}>No shifts yet — add one first</Text>
              : <>
                  <TouchableOpacity style={s.dropdownBtn} onPress={() => setShowShiftDrop(v => !v)}>
                    <FontAwesome5 iconStyle="solid" name="layer-group" size={18} color="#F59E0B" />
                    <Text style={[s.dropdownBtnTxt, !shiftId && { color: '#94A3B8' }]} numberOfLines={1}>
                      {shiftId ? (shifts.find(sh => String(sh.id) === shiftId)?.name || `Shift #${shiftId}`) : 'Select shift schedule'}
                    </Text>
                    <FontAwesome5 iconStyle="solid" name={showShiftDrop ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
                  </TouchableOpacity>
                  {showShiftDrop && (
                    <View style={s.dropdownList}>
                      {shifts.map(sh => (
                        <TouchableOpacity
                          key={sh.id}
                          style={[s.dropdownItem, shiftId === String(sh.id) && s.dropdownItemActive]}
                          onPress={() => { setShiftId(String(sh.id)); setShowShiftDrop(false) }}
                        >
                          <Text style={[s.dropdownItemTxt, shiftId === String(sh.id) && s.dropdownItemTxtActive]} numberOfLines={1}>
                            {sh.name || `Shift #${sh.id}`}
                          </Text>
                          {shiftId === String(sh.id) && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
            }
            <AppInput label="Label" placeholder="e.g. Morning Shift" value={label} onChangeText={setLabel} leftIcon="bookmark-outline" />
            <TouchableOpacity style={s.dobBtn} onPress={() => { setTempStart(start); setShowStart(true) }}>
              <FontAwesome5 iconStyle="solid" name="clock" size={18} color="#6366F1" />
              <Text style={s.dobBtnTxt}>{toTimeStr(start)}</Text>
            </TouchableOpacity>
            {showStart && (
              <View style={s.pickerWrap}>
                <View style={s.pickerActions}>
                  <TouchableOpacity onPress={() => setShowStart(false)}><Text style={s.pickerCancelTxt}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setStart(tempStart); setShowStart(false) }}><Text style={s.pickerDoneTxt}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempStart} mode="time" display="spinner" onValueChange={(_e, d) => { if (d) setTempStart(d) }} />
              </View>
            )}
            <TouchableOpacity style={s.dobBtn} onPress={() => { setTempEnd(end); setShowEnd(true) }}>
              <FontAwesome5 iconStyle="solid" name="clock" size={18} color="#6366F1" />
              <Text style={s.dobBtnTxt}>{toTimeStr(end)}</Text>
            </TouchableOpacity>
            {showEnd && (
              <View style={s.pickerWrap}>
                <View style={s.pickerActions}>
                  <TouchableOpacity onPress={() => setShowEnd(false)}><Text style={s.pickerCancelTxt}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEnd(tempEnd); setShowEnd(false) }}><Text style={s.pickerDoneTxt}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempEnd} mode="time" display="spinner" onValueChange={(_e, d) => { if (d) setTempEnd(d) }} />
              </View>
            )}
            <Text style={s.dayLabel}>Day of Week</Text>
            <View style={s.daysRow}>
              {DAYS.map((d, i) => (
                <TouchableOpacity key={d} style={[s.dayBtn, day === i && s.dayBtnA]} onPress={() => setDay(i)}>
                  <Text style={[s.dayBtnTxt, day === i && s.dayBtnTxtA]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <AppButton title={editItem ? 'Save Changes' : 'Create'} onPress={onSave} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setModal(false)} fullWidth />
            <View style={{ height: 16 }} />
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
    </>
  )
}

// ─── Public Holiday Section ───────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function PublicHolidaySection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const { publicHolidays, isLoading, loadPublicHolidays, createPublicHoliday, updatePublicHoliday, deletePublicHoliday } = useAdminViewModel()
  const { showAlert, alertProps } = useAlert()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem]         = useState<PublicHoliday | null>(null)
  const [name, setName] = useState('')
  const [date, setDate]               = useState<Date | null>(null)
  const [tempDate, setTempDate]       = useState<Date>(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [amountDay, setAmountDay]     = useState('1')
  const [description, setDescription] = useState('')

  useEffect(() => { loadPublicHolidays() }, [])
  useEffect(() => { onRegisterAdd?.(() => { setEditItem(null); setName(''); setDate(null); setAmountDay('1'); setDescription(''); setModal(true) }) }, [onRegisterAdd])

  const openEdit = (item: PublicHoliday) => {
    setEditItem(item)
    setName(item.name)
    const d = new Date(item.year, item.month - 1, item.day)
    setDate(d); setTempDate(d)
    const amtDay = item.amountDay ?? (item as any).amount_day
    setAmountDay(amtDay != null ? String(amtDay) : '1')
    setDescription(item.description ?? '')
    setModal(true)
  }

  const onSave = () => {
    if (!name || !date) {
      showAlert({ title: 'Error', message: 'Name and date are required', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    const y = date.getFullYear(), mo = date.getMonth() + 1, d = date.getDate()
    const dateStr = `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const isEdit = editItem != null
    showConfirm({
      title: isEdit ? 'Save Changes' : 'Create Public Holiday',
      message: isEdit ? `Save changes to "${name}"?` : `Add "${name}" on ${dateStr}?`,
      icon: 'calendar-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: isEdit ? 'Save' : 'Create', onPress: async () => {
          try {
            if (isEdit) {
              await updatePublicHoliday(editItem.id, { name, date: dateStr, amountDay: Number(amountDay), description: description || null, year: y, month: mo, day: d })
            } else {
              await createPublicHoliday({ name, date: dateStr, amountDay: Number(amountDay), description: description || null, year: y, month: mo, day: d })
            }
            setModal(false); setEditItem(null); setName(''); setDate(null); setAmountDay('1'); setDescription('')
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  const onDelete = (id: number, name: string) =>
    showAlert({
      title: 'Delete', message: `Remove "${name}"?`, icon: 'trash-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePublicHoliday(id) },
      ],
    })

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{publicHolidays.length} holidays</Text>
      </View>
      <FlatList
        data={publicHolidays}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadPublicHolidays()} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No public holidays yet</Text>}
        renderItem={({ item }: { item: PublicHoliday }) => (
          <View style={s.listItem}>
            <View style={s.rowItem}>
              <View style={[s.iconBox, { backgroundColor: '#FEE2E2' }]}>
                <FontAwesome5 iconStyle="solid" name="calendar-alt" size={22} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{item.name}</Text>
                <Text style={s.itemSub}>
                  {String(item.day).padStart(2,'0')} {MONTHS[(item.month ?? 1) - 1]} {item.year}
                </Text>
                <Text style={s.itemSub}>
                  {(() => { const a = item.amountDay ?? (item as any).amount_day ?? 1; return `${a} day${a !== 1 ? 's' : ''}` })()}
                </Text>
                {item.description ? <Text style={[s.itemSub, { marginTop: 2 }]}>{item.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={s.editBtn}>
                <FontAwesome5 iconStyle="solid" name="edit" size={18} color="#6366F1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id, item.name)} style={s.iconBtn}>
                <FontAwesome5 iconStyle="solid" name="trash-alt" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <AppAlert {...alertProps} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <ScrollView style={s.sheet} keyboardShouldPersistTaps="handled">
            <Text style={[s.sheetTitle, { marginBottom: 16 }]}>{editItem ? 'Edit Public Holiday' : 'New Public Holiday'}</Text>
            <AppInput label="Name" placeholder="e.g. New Year" value={name} onChangeText={setName} leftIcon="calendar-alt" />
            <TouchableOpacity style={s.dobBtn} onPress={() => { setTempDate(date ?? new Date()); setShowDatePicker(true) }}>
              <FontAwesome5 iconStyle="solid" name="calendar-day" size={18} color="#6366F1" />
              <Text style={[s.dobBtnTxt, !date && { color: '#94A3B8' }]}>
                {date ? `${String(date.getDate()).padStart(2,'0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={s.pickerWrap}>
                <View style={s.pickerActions}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}><Text style={s.pickerCancelTxt}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDate(tempDate); setShowDatePicker(false) }}><Text style={s.pickerDoneTxt}>Done</Text></TouchableOpacity>
                </View>
                <DateTimePicker value={tempDate} mode="date" display="spinner" onValueChange={(_e, d) => { if (d) setTempDate(d) }} />
              </View>
            )}
            <AppInput label="Amount of Days" placeholder="1" value={amountDay} onChangeText={setAmountDay} keyboardType="numeric" leftIcon="clock" />
            <AppInput label="Description (optional)" placeholder="Notes..." value={description} onChangeText={setDescription} leftIcon="file-alt" />
            <AppButton title={editItem ? 'Save Changes' : 'Create'} onPress={onSave} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setModal(false)} fullWidth />
            <View style={{ height: 16 }} />
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
    </>
  )
}


// ─── Leave Requests Section ───────────────────────────────────────────────────
type LeaveFilter = 'all' | 'pending' | 'approved' | 'rejected'
const LEAVE_FILTERS: LeaveFilter[] = ['all', 'pending', 'approved', 'rejected']
const LEAVE_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#F59E0B' },
  approved: { bg: '#D1FAE5', text: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#EF4444' },
}
const LEAVE_TYPE_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  leave:      { icon: 'umbrella',      bg: '#EEF2FF', color: '#6366F1' },
  sick:       { icon: 'medkit',         bg: '#FEE2E2', color: '#EF4444' },
  permission: { icon: 'file-alt', bg: '#D1FAE5', color: '#10B981' },
}

function LeaveRequestsSection() {
  const { user: authUser } = useSelector((s: RootState) => s.auth)
  const { permissions, isLoading, loadPermissions, approvePermission, rejectPermission } = useAdminViewModel()
  const [filter, setFilter] = useState<LeaveFilter>('all')
  const [search, setSearch] = useState('')
  const [notesModal, setNotesModal] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null)
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [viewImages, setViewImages] = useState<string[] | null>(null)
  const [imageIndex, setImageIndex] = useState(0)

  const isAdmin = authUser?.role === 'admin'

  useFocusEffect(useCallback(() => {
    if (!isAdmin) return
    loadPermissions(filter === 'all' ? undefined : filter)
  }, [filter, isAdmin]))

  const handleAction = async () => {
    if (!notesModal) return
    setActionLoading(true)
    try {
      if (notesModal.action === 'approve') await approvePermission(notesModal.id, notes)
      else await rejectPermission(notesModal.id, notes)
      setNotesModal(null)
      setNotes('')
      if (isAdmin) loadPermissions(filter === 'all' ? undefined : filter)
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Action failed. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // authUser is null only during redux-persist rehydration — wait before blocking
  if (authUser !== null && !isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <FontAwesome5 iconStyle="solid" name="lock" size={40} color="#CBD5E1" />
        <Text style={{ fontSize: 15, color: '#94A3B8', fontWeight: '600' }}>Admin access required</Text>
      </View>
    )
  }

  const filtered = (permissions as UserPermission[]).filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (p.user?.fullName ?? '').toLowerCase().includes(q) ||
      (p.user?.email ?? '').toLowerCase().includes(q) ||
      String(p.userId).includes(q)
    )
  })

  const openImages = (item: UserPermission, idx: number) => {
    const urls = (item.photos ?? [])
      .map(ph => `${SERVER_URL}${ph.photoPath}`)
      .filter(Boolean)
    if (item.photoPath && urls.length === 0) urls.push(`${SERVER_URL}${item.photoPath}`)
    if (urls.length === 0) return
    setImageIndex(idx < urls.length ? idx : 0)
    setViewImages(urls)
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Search bar */}
      <View style={s.searchWrap}>
        <FontAwesome5 iconStyle="solid" name="search" size={16} color="#94A3B8" style={{ marginRight: 6 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search by name..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 iconStyle="solid" name="times-circle" size={16} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <View style={s.filterRow}>
        {LEAVE_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[s.filterTxt, filter === f && s.filterTxtActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={filtered}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.leaveList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadPermissions(filter === 'all' ? undefined : filter)} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>{search ? 'No results found' : 'No leave requests'}</Text>}
        renderItem={({ item, index }: { item: UserPermission; index: number }) => {
          const col    = LEAVE_COLORS[item.status] ?? { bg: '#F1F5F9', text: '#64748B' }
          const typeKey = item.type?.toLowerCase()
          const ti = LEAVE_TYPE_ICONS[typeKey] ?? LEAVE_TYPE_ICONS.permission
          const days = item.amountDay ?? 1
          const photos = [
            ...(item.photos ?? []).map(ph => `${SERVER_URL}${ph.photoPath}`),
            ...(item.photoPath && !(item.photos?.length) ? [`${SERVER_URL}${item.photoPath}`] : []),
          ]
          const firstPhoto = photos[0]
          const isLast = index === filtered.length - 1

          return (
            <View style={[s.leaveRow, !isLast && s.leaveRowBorder]}>
              {/* Photo or type icon — same as user view */}
              <TouchableOpacity
                onPress={() => openImages(item, 0)}
                disabled={photos.length === 0}
                activeOpacity={0.8}
                style={s.leaveThumbWrap}
              >
                {firstPhoto ? (
                  <Image source={{ uri: firstPhoto }} style={s.leaveThumb} resizeMode="cover" />
                ) : (
                  <View style={[s.leaveThumbFallback, { backgroundColor: ti.bg }]}>
                    <FontAwesome5 iconStyle="solid" name={ti.icon as any} size={22} color={ti.color} />
                  </View>
                )}
                {photos.length > 1 && (
                  <View style={s.leavePhotoBadge}>
                    <Text style={s.leavePhotoBadgeTxt}>{photos.length}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                {/* Name + status badge */}
                <View style={s.leaveRowTop}>
                  <Text style={s.leaveRowName} numberOfLines={1}>
                    {item.user?.fullName ?? item.user?.email ?? `User #${item.userId}`}
                  </Text>
                  <View style={[s.leaveStatusBadge, { backgroundColor: col.bg }]}>
                    <Text style={[s.leaveStatusTxt, { color: col.text }]}>{item.status}</Text>
                  </View>
                </View>
                {/* Type · date */}
                <Text style={s.leaveRowDate}>
                  {(item as any).leaveType?.name ?? item.type}  ·  {fmtDate(item.startDate)}{item.startDate !== item.endDate ? ` – ${fmtDate(item.endDate)}` : ''}
                </Text>
                {/* Days + reason */}
                <View style={s.leaveRowMeta}>
                  <View style={s.leaveMetaChip}>
                    <FontAwesome5 iconStyle="solid" name="clock" size={10} color="#64748B" />
                    <Text style={s.leaveMetaChipTxt}>{days} day{days !== 1 ? 's' : ''}</Text>
                  </View>
                  {item.reason ? <Text style={s.leaveRowReason} numberOfLines={1}>{item.reason}</Text> : null}
                </View>
                {/* Notes */}
                {item.notes ? (
                  <View style={s.leaveNotesBox}>
                    <FontAwesome5 iconStyle="solid" name="comment" size={10} color="#6366F1" />
                    <Text style={s.leaveNotesTxt} numberOfLines={2}>{item.notes}</Text>
                  </View>
                ) : null}
                {/* Approve / Reject inline */}
                {item.status === 'pending' && (
                  <View style={s.leaveInlineActions}>
                    <TouchableOpacity style={s.leaveApproveInline} onPress={() => { setNotesModal({ id: item.id, action: 'approve' }); setNotes('') }} activeOpacity={0.7}>
                      <FontAwesome5 iconStyle="solid" name="check-circle" size={13} color="#6366F1" />
                      <Text style={s.leaveApproveInlineTxt}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.leaveRejectInline} onPress={() => { setNotesModal({ id: item.id, action: 'reject' }); setNotes('') }} activeOpacity={0.7}>
                      <FontAwesome5 iconStyle="solid" name="times-circle" size={13} color="#EF4444" />
                      <Text style={s.leaveRejectInlineTxt}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )
        }}
      />

      {/* Notes / action modal */}
      <Modal visible={!!notesModal} transparent animationType="slide">
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={s.sheet}>
            <Text style={[s.sheetTitle, { marginBottom: 16 }]}>{notesModal?.action === 'approve' ? 'Approve Request' : 'Reject Request'}</Text>
            <AppInput label="Notes (optional)" placeholder="Add a note..." value={notes} onChangeText={setNotes} leftIcon="comment" />
            <AppButton
              title={notesModal?.action === 'approve' ? 'Approve' : 'Reject'}
              onPress={handleAction}
              loading={actionLoading}
              fullWidth
              style={{ marginBottom: 10, backgroundColor: notesModal?.action === 'approve' ? '#6366F1' : '#EF4444' }}
            />
            <AppButton title="Cancel" variant="danger" onPress={() => setNotesModal(null)} fullWidth />
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Full-screen image viewer */}
      <Modal visible={!!viewImages} transparent animationType="fade" onRequestClose={() => setViewImages(null)}>
        <View style={s.imgViewerBg}>
          <TouchableOpacity style={s.imgViewerClose} onPress={() => setViewImages(null)}>
            <FontAwesome5 iconStyle="solid" name="times-circle" size={34} color="#fff" />
          </TouchableOpacity>
          {viewImages && (
            <>
              <FlatList
                data={viewImages}
                keyExtractor={(_, i) => String(i)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={imageIndex}
                style={{ alignSelf: 'stretch' }}
                getItemLayout={(_, i) => ({ length: Dimensions.get('window').width, offset: Dimensions.get('window').width * i, index: i })}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width)
                  setImageIndex(idx)
                }}
                renderItem={({ item: uri }) => (
                  <Image
                    source={{ uri }}
                    style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.72 }}
                    resizeMode="contain"
                  />
                )}
              />
              {viewImages.length > 1 && (
                <View style={s.imgDots}>
                  {viewImages.map((_, i) => (
                    <View key={i} style={[s.imgDot, i === imageIndex && s.imgDotActive]} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  )
}

// ─── Leave Type Section ───────────────────────────────────────────────────────
function LeaveTypeSection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const { leaveTypes, isLoading, loadLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } = useAdminViewModel()
  const { showAlert, alertProps } = useAlert()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem]   = useState<LeaveType | null>(null)
  const [name, setName] = useState('')
  const [maxDays, setMaxDays] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => { loadLeaveTypes() }, [])
  useEffect(() => { onRegisterAdd?.(() => { setEditItem(null); setName(''); setMaxDays(''); setDescription(''); setModal(true) }) }, [onRegisterAdd])

  const openEdit = (item: LeaveType) => {
    setEditItem(item)
    setName(item.name)
    const maxD = item.maxDays ?? (item as any).max_days
    setMaxDays(maxD != null ? String(maxD) : '')
    setDescription(item.description ?? '')
    setModal(true)
  }

  const onSave = () => {
    if (!name) {
      showAlert({ title: 'Error', message: 'Name is required', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    const isEdit = editItem != null
    showConfirm({
      title: isEdit ? 'Save Changes' : 'Create Leave Type',
      message: isEdit ? `Save changes to "${name}"?` : `Add leave type "${name}"?`,
      icon: 'list', iconColor: '#EC4899', iconBg: '#FCE7F3',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: isEdit ? 'Save' : 'Create', onPress: async () => {
          try {
            if (isEdit) {
              await updateLeaveType(editItem.id, { name, maxDays: maxDays ? Number(maxDays) : null, description: description || null })
            } else {
              await createLeaveType({ name, maxDays: maxDays ? Number(maxDays) : null, description: description || null })
            }
            setModal(false); setEditItem(null); setName(''); setMaxDays(''); setDescription('')
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  const onDelete = (id: number, name: string) =>
    showAlert({
      title: 'Delete', message: `Remove "${name}"?`, icon: 'trash-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteLeaveType(id) },
      ],
    })

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{leaveTypes.length} leave types</Text>
      </View>
      <FlatList
        data={leaveTypes as LeaveType[]}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadLeaveTypes} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No leave types yet</Text>}
        renderItem={({ item }: { item: LeaveType }) => (
          <View style={s.listItem}>
            <View style={s.rowItem}>
              <View style={[s.iconBox, { backgroundColor: '#FCE7F3' }]}>
                <FontAwesome5 iconStyle="solid" name="list" size={22} color="#EC4899" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{item.name}</Text>
                <Text style={s.itemSub}>{(() => { const m = item.maxDays ?? (item as any).max_days; return m != null ? `Max ${m} days/year` : 'Unlimited' })()}</Text>
                {item.description ? <Text style={s.itemSub}>{item.description}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => openEdit(item)} style={s.editBtn}>
                <FontAwesome5 iconStyle="solid" name="edit" size={18} color="#6366F1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id, item.name)} style={s.iconBtn}>
                <FontAwesome5 iconStyle="solid" name="trash-alt" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <AppAlert {...alertProps} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={s.sheet}>
            <Text style={[s.sheetTitle, { marginBottom: 16 }]}>{editItem ? 'Edit Leave Type' : 'New Leave Type'}</Text>
            <AppInput label="Name" placeholder="e.g. Annual Leave" value={name} onChangeText={setName} leftIcon="list" />
            <AppInput label="Max Days / Year (optional)" placeholder="e.g. 12" value={maxDays} onChangeText={setMaxDays} keyboardType="numeric" leftIcon="clock" />
            <AppInput label="Description (optional)" placeholder="Notes..." value={description} onChangeText={setDescription} leftIcon="file-alt" />
            <AppButton title={editItem ? 'Save Changes' : 'Create'} onPress={onSave} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setModal(false)} fullWidth />
          </View>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
    </>
  )
}

// ─── Daily Work Section ───────────────────────────────────────────────────────
const DW_MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

type DailyWork = {
  id: number
  userId: number
  user?: { fullName?: string | null; email?: string }
  photoPath?: string | null
  photos?: { photoPath: string }[]
  year?: number
  month?: number
  day?: number
  time?: string | null
  status?: 'pending' | 'approved' | 'rejected' | string | null
  note?: string | null
  createdAt?: string
}

const DW_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#F59E0B' },
  approved: { bg: '#D1FAE5', text: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#EF4444' },
}

function DailyWorkSection() {
  const { showAlert, alertProps } = useAlert()
  const now = new Date()
  const [year, setYear]             = useState(now.getFullYear())
  const [month, setMonth]           = useState(now.getMonth() + 1)
  const [records, setRecords]       = useState<DailyWork[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionId, setActionId]     = useState<number | null>(null)

  const load = useCallback(async (y: number, m: number, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await adminService.getMonthlyDailyWorks(y, m)
      setRecords(Array.isArray(res) ? res : (res?.data ?? []))
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { load(year, month) }, [year, month])

  const handleApprove = (id: number) => {
    showAlert({
      title: 'Approve', message: 'Approve this daily work record?', icon: 'check-circle', iconColor: '#10B981', iconBg: '#D1FAE5',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: async () => {
          setActionId(id)
          try {
            await adminService.approveDailyWork(id)
            setRecords(p => p.map(r => r.id === id ? { ...r, status: 'approved' } : r))
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || 'Failed.', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          } finally { setActionId(null) }
        }},
      ],
    })
  }

  const handleReject = (id: number) => {
    showAlert({
      title: 'Reject', message: 'Reject this daily work record?', icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: async () => {
          setActionId(id)
          try {
            await adminService.rejectDailyWork(id)
            setRecords(p => p.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || 'Failed.', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          } finally { setActionId(null) }
        }},
      ],
    })
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const isFuture = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)

  return (
    <>
      {/* Month selector */}
      <View style={s.sectionBar}>
        <TouchableOpacity onPress={prevMonth} style={s.monthArrowBtn}>
          <FontAwesome5 iconStyle="solid" name="chevron-left" size={18} color="#6366F1" />
        </TouchableOpacity>
        <Text style={s.sectionCount}>
          {DW_MONTH_NAMES[month - 1]} {year}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={[s.monthArrowBtn, isFuture && { opacity: 0.35 }]} disabled={isFuture}>
          <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#6366F1" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text style={s.sectionCount}>{records.length} records</Text>
      </View>

      <AppAlert {...alertProps} />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(year, month, true) }} colors={['#6366F1']} />}
          ListEmptyComponent={<Text style={s.empty}>No daily work records</Text>}
          renderItem={({ item }: { item: DailyWork }) => {
            const col = DW_STATUS_COLORS[item.status ?? 'pending'] ?? DW_STATUS_COLORS.pending
            const name = item.user?.fullName || item.user?.email || `User #${item.userId}`
            const dateStr = item.day ? `${String(item.day).padStart(2,'0')} ${DW_MONTH_NAMES[(item.month ?? 1) - 1]} ${item.year}` : '—'
            const isActioning = actionId === item.id
            return (
              <View style={s.listItem}>
                <View style={s.rowItem}>
                  <View style={[s.iconBox, { backgroundColor: '#FFEDD5' }]}>
                    <FontAwesome5 iconStyle="solid" name="briefcase" size={22} color="#F97316" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.itemTitle}>{name}</Text>
                    <Text style={s.itemSub}>{dateStr}{item.time ? `  ·  ${item.time}` : ''}</Text>
                  </View>
                  <View style={[s.pill, { backgroundColor: col.bg }]}>
                    <Text style={[s.pillTxt, { color: col.text }]}>{item.status ?? 'pending'}</Text>
                  </View>
                </View>
                {(!item.status || item.status === 'pending') && (
                  <View style={s.leaveActions}>
                    <TouchableOpacity
                      style={s.approveBtn}
                      onPress={() => handleApprove(item.id)}
                      disabled={isActioning}
                      activeOpacity={0.7}
                    >
                      {isActioning
                        ? <ActivityIndicator size="small" color="#6366F1" />
                        : <FontAwesome5 iconStyle="solid" name="check-circle" size={16} color="#6366F1" />
                      }
                      <Text style={[s.leaveBtnTxt, { color: '#6366F1' }]}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.rejectBtn}
                      onPress={() => handleReject(item.id)}
                      disabled={isActioning}
                    >
                      <FontAwesome5 iconStyle="solid" name="times-circle" size={16} color="#EF4444" />
                      <Text style={[s.leaveBtnTxt, { color: '#EF4444' }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )
          }}
        />
      )}
    </>
  )
}

// ─── Announcements Section ────────────────────────────────────────────────────
function AnnouncementsSection({ onRegisterAdd }: { onRegisterAdd?: (fn: () => void) => void }) {
  const { announcements, isLoading, loadAnnouncements, createAnnouncement, deleteAnnouncement } = useAdminViewModel()
  const { showAlert, alertProps } = useAlert()
  const { showAlert: showConfirm, alertProps: confirmProps } = useAlert()
  const [modal, setModal] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => { loadAnnouncements() }, [])
  useEffect(() => { onRegisterAdd?.(() => setModal(true)) }, [onRegisterAdd])

  const onCreate = () => {
    if (!title || !content) {
      showAlert({ title: 'Error', message: 'Title and content are required', icon: 'exclamation-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
      return
    }
    showConfirm({
      title: 'Post Announcement', message: `Post "${title}" to all users?`,
      icon: 'bullhorn', iconColor: '#6366F1', iconBg: '#EEF2FF',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Post', onPress: async () => {
          try {
            await createAnnouncement({ title, content })
            setModal(false); setTitle(''); setContent('')
          } catch (e: any) {
            showAlert({ title: 'Error', message: e?.response?.data?.message || e.message, icon: 'times-circle', iconColor: '#EF4444', iconBg: '#FEE2E2', buttons: [{ text: 'OK' }] })
          }
        }},
      ],
    })
  }

  const onDelete = (id: number, title: string) =>
    showAlert({
      title: 'Delete', message: `Remove "${title}"?`, icon: 'trash-alt', iconColor: '#EF4444', iconBg: '#FEE2E2',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAnnouncement(id) },
      ],
    })

  return (
    <>
      <View style={s.sectionBar}>
        <Text style={s.sectionCount}>{announcements.length} announcements</Text>
      </View>
      <FlatList
        data={announcements as Announcement[]}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAnnouncements} colors={['#6366F1']} />}
        ListEmptyComponent={<Text style={s.empty}>No announcements yet</Text>}
        renderItem={({ item }: { item: Announcement }) => (
          <View style={s.listItem}>
            <View style={s.rowItem}>
              <View style={[s.iconBox, { backgroundColor: '#EEF2FF' }]}>
                <FontAwesome5 iconStyle="solid" name="bullhorn" size={22} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemSub} numberOfLines={2}>{item.content}</Text>
                <Text style={[s.itemSub, { color: '#CBD5E1', marginTop: 4 }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => showAlert({ title: 'Cannot Edit', message: 'Announcements cannot be edited. Please delete and create a new one.', icon: 'information-circle-outline', iconColor: '#F59E0B', iconBg: '#FEF3C7', buttons: [{ text: 'OK' }] })} style={s.editBtn}>
                <FontAwesome5 iconStyle="solid" name="edit" size={18} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item.id, item.title)} style={s.iconBtn}>
                <FontAwesome5 iconStyle="solid" name="trash-alt" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <AppAlert {...alertProps} />
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
          <View style={s.sheet}>
            <Text style={[s.sheetTitle, { marginBottom: 16 }]}>New Announcement</Text>
            <AppInput label="Title" placeholder="Announcement title" value={title} onChangeText={setTitle} leftIcon="bullhorn" />
            <AppInput label="Content" placeholder="Write your announcement..." value={content} onChangeText={setContent} leftIcon="file-alt" />
            <AppButton title="Post" onPress={onCreate} loading={isLoading} fullWidth style={{ marginBottom: 10 }} />
            <AppButton title="Cancel" variant="danger" onPress={() => setModal(false)} fullWidth />
          </View>
          </KeyboardAvoidingView>
        </View>
        <AppAlert {...confirmProps} useModal={false} />
      </Modal>
    </>
  )
}

// ─── Main Detail Screen ───────────────────────────────────────────────────────
export default function ManageDetailScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { section, title } = route.params as { section: string; title: string }
  const [addFn, setAddFn] = useState<(() => void) | null>(null)

  const registerAdd = useCallback((fn: () => void) => {
    setAddFn(() => fn)
  }, [])

  const renderContent = () => {
    switch (section) {
      case 'Campuses':       return <CampusesSection onRegisterAdd={registerAdd} />
      case 'Users':          return <UsersSection onRegisterAdd={registerAdd} />
      case 'Timetable':      return <TimetableSection onRegisterAdd={registerAdd} />
      case 'PublicHoliday':  return <PublicHolidaySection onRegisterAdd={registerAdd} />
      case 'LeaveRequests':  return <LeaveRequestsSection />
      case 'LeaveType':      return <LeaveTypeSection onRegisterAdd={registerAdd} />
      case 'CheckIns':       return <ComingSoon icon="qrcode" title="Check-ins" />
      case 'DailyWork':      return <DailyWorkSection />
      case 'Announcements':  return <AnnouncementsSection onRegisterAdd={registerAdd} />
      default:               return <ComingSoon icon="construct-outline" title={title} />
    }
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{title}</Text>
        {addFn ? (
          <TouchableOpacity onPress={addFn} style={s.headerAddBtn}>
            <FontAwesome5 iconStyle="solid" name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerAddBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center' },

  sectionBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, flexWrap: 'wrap', gap: 8 },
  sectionCount: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  excelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff' },
  excelBtnTxt: { fontSize: 12, fontWeight: '600' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6366F1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnTxt: { fontSize: 13, fontWeight: '600', color: '#fff' },

  list: { paddingBottom: 120 },
  card: { marginBottom: 10 },
  listItem: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ava: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  avaTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  pill: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  pillTxt: { fontSize: 11, fontWeight: '600' },
  iconBtn: { padding: 8 },
  editBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  userItemActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  userItemBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 2 },
  userItemBtnTxt: { fontSize: 12, fontWeight: '700' },
  userItemDivider: { width: 1, height: 14, backgroundColor: '#E2E8F0' },
  itemMeta: { fontSize: 11, color: '#6366F1', marginTop: 3 },

  // WiFi input row inside campus form
  wifiInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 6 },
  wifiAddBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  wifiChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 6 },
  wifiChipTxt: { flex: 1, fontSize: 13, fontWeight: '600', color: '#10B981' },

  // Campus info row (radius + wifi chips in one line)
  campusInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'nowrap' },
  campusInfoChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F8FAFC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  campusInfoTxt: { fontSize: 11, fontWeight: '600', color: '#6366F1' },

  // Modern user card
  userCard: { backgroundColor: '#fff', marginHorizontal: 12, marginVertical: 5, borderRadius: 16, padding: 14, shadowColor: '#94A3B8', shadowOpacity: 0.10, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  userCardTop: { flexDirection: 'row', alignItems: 'center' },
  userCardBadge: { backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  userCardBadgeTxt: { fontSize: 11, fontWeight: '700' },
  userCardChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  userCardActions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  userActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 4 },
  userActionTxt: { fontSize: 12, fontWeight: '700' },
  userActionDivider: { width: 1, height: 16, backgroundColor: '#E2E8F0' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F0FF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  infoChipTxt: { fontSize: 11, fontWeight: '600', color: '#8B5CF6' },
  infoChipDot: { width: 6, height: 6, borderRadius: 3 },
  empty: { textAlign: 'center', color: '#94A3B8', marginTop: 40 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, marginTop: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statN: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  statL: { fontSize: 11, color: '#64748B', marginTop: 2 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  roleBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  roleTxt: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  roleTxtActive: { color: '#6366F1' },
  // Leave Requests filter — pill style matching MyLeaveScreen
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  filterBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  filterTxt: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  filterTxtActive: { color: '#6366F1' },
  leaveActions: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: '#EEF2FF' },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FEE2E2' },
  leaveBtnTxt: { fontSize: 13, fontWeight: '700' },
  // Tab bar
  tabRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', margin: 16, borderRadius: 12, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  tabTxt: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabTxtActive: { color: '#6366F1' },
  // Shift picker in modal
  shiftPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  shiftChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  shiftChipActive: { borderColor: '#F59E0B', backgroundColor: '#FEF3C7' },
  shiftChipTxt: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  shiftChipTxtActive: { color: '#F59E0B' },
  dayLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  daysRow: { flexDirection: 'row', gap: 6, marginBottom: 20, flexWrap: 'wrap' },
  dayBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#E2E8F0' },
  dayBtnA: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  dayBtnTxt: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  dayBtnTxtA: { color: '#6366F1' },
  monthArrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sheetCloseBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  formSection: { fontSize: 12, fontWeight: '700', color: '#6366F1', textTransform: 'uppercase', letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  toggleSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  toggleTrack: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#E2E8F0', padding: 2, justifyContent: 'center' },
  toggleTrackOn: { backgroundColor: '#6366F1' },
  toggleTrackGreen: { backgroundColor: '#10B981' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  toggleThumbOn: { alignSelf: 'flex-end' },
  dobBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 12, backgroundColor: '#fff' },
  dobBtnTxt: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#fff', marginBottom: 4 },
  dropdownBtnTxt: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1E293B' },
  dropdownList: { borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, backgroundColor: '#fff', marginBottom: 12, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  dropdownItemActive: { backgroundColor: '#EEF2FF' },
  dropdownItemTxt: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' },
  dropdownItemTxtActive: { color: '#6366F1', fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E1', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  // DateTimePicker Done/Cancel row
  pickerWrap: { backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 12, overflow: 'hidden' },
  pickerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#fff' },
  pickerCancelTxt: { fontSize: 15, fontWeight: '600', color: '#94A3B8' },
  pickerDoneTxt: { fontSize: 15, fontWeight: '700', color: '#6366F1' },
  // Leave Requests — search
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B', padding: 0 },
  // Leave Requests — flat rows (matching MyLeaveScreen)
  leaveList: { paddingBottom: 120, backgroundColor: '#fff' },
  leaveRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
  leaveRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  leaveRowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  leaveRowName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E293B', marginRight: 8 },
  leaveRowDate: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  leaveRowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  leaveRowReason: { flex: 1, fontSize: 11, color: '#94A3B8' },
  leaveMetaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  leaveMetaChipTxt: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  leaveNotesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginTop: 5 },
  leaveNotesTxt: { flex: 1, fontSize: 11, color: '#6366F1', lineHeight: 15 },
  leaveStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  leaveStatusTxt: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  leaveInlineActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  leaveApproveInline: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#EEF2FF' },
  leaveApproveInlineTxt: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
  leaveRejectInline: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FEE2E2' },
  leaveRejectInlineTxt: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  // Leave Requests — photo / type icon thumb
  leaveThumbWrap: { position: 'relative' },
  leaveThumb: { width: 52, height: 52, borderRadius: 12 },
  leaveThumbFallback: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  leaveAvatar: { width: 52, height: 52, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  leaveAvatarTxt: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  leavePhotoBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  leavePhotoBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },
  // Full-screen image viewer
  imgViewerBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imgViewerClose: { position: 'absolute', top: 52, right: 20, zIndex: 10 },
  imgDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  imgDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  imgDotActive: { backgroundColor: '#fff', width: 18 },
})
