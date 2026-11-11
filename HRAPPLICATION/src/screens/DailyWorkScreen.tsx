import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  KeyboardAvoidingView, ScrollView, Image, Platform, Animated,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { attendanceService } from '../services/attendanceService'
import { SERVER_URL } from '../services/api'
import { RootState } from '../store'
import { Campus } from '../models'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

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

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  pending:  { bg: '#FEF3C7', text: '#F59E0B', icon: 'clock' },
  approved: { bg: '#D1FAE5', text: '#10B981', icon: 'check-circle' },
  rejected: { bg: '#FEE2E2', text: '#EF4444', icon: 'times-circle' },
}

function getDateStr(item: DailyWork, fallbackYear: number) {
  const day = item.day ?? (item.createdAt ? new Date(item.createdAt).getDate() : null)
  const mon = item.month ?? (item.createdAt ? new Date(item.createdAt).getMonth() + 1 : null)
  if (day && mon) return `${String(day).padStart(2, '0')} ${MONTHS[mon - 1]} ${item.year ?? fallbackYear}`
  if (item.createdAt) return new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
  return '—'
}

function ConfirmAlert({
  visible,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const scale = useRef(new Animated.Value(0.85)).current
  useEffect(() => {
    if (visible) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }).start()
    } else {
      scale.setValue(0.85)
    }
  }, [visible])

  if (!visible) return null

  return (
    <View style={[ca.overlay, StyleSheet.absoluteFill]}>
      <Animated.View style={[ca.card, { transform: [{ scale }] }]}>
        <View style={ca.iconBox}>
          <FontAwesome5 iconStyle="solid" name="briefcase" size={32} color="#6366F1" />
        </View>
        <Text style={ca.title}>Confirm Daily Work</Text>
        <Text style={ca.body}>Submit your daily work report?</Text>
        <View style={ca.btnRow}>
          <TouchableOpacity style={ca.btnCancel} onPress={onCancel} activeOpacity={0.8}>
            <Text style={ca.btnCancelTxt}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ca.btnConfirm} onPress={onConfirm} activeOpacity={0.8}>
            <Text style={ca.btnConfirmTxt}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

export default function DailyWorkScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const authUser = useSelector((s: RootState) => s.auth.user)

  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [items, setItems]           = useState<DailyWork[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch]         = useState('')

  // Create form
  const [showCreate, setShowCreate]       = useState(false)
  const [description, setDescription]     = useState('')
  const [photos, setPhotos]               = useState<{ uri: string; base64: string }[]>([])
  const [saving, setSaving]               = useState(false)
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [campuses, setCampuses]           = useState<Campus[]>([])
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(authUser?.campusId ?? null)
  const [showCampusPicker, setShowCampusPicker] = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await attendanceService.getMyDailyWorks(year, month)
      setItems(data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [year, month])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(item => {
      const dateStr = getDateStr(item, year).toLowerCase()
      const noteTxt = (item.description ?? '').toLowerCase()
      const creator = (item.user?.fullName ?? item.user?.email ?? '').toLowerCase()
      const approverName = (item.approver?.fullName ?? item.approver?.email ?? '').toLowerCase()
      return dateStr.includes(q) || noteTxt.includes(q) || creator.includes(q) || approverName.includes(q)
    })
  }, [items, search, year])

  const openCreate = () => {
    setSelectedCampusId(authUser?.campusId ?? null)
    attendanceService.getCampuses().then(setCampuses).catch(() => {})
    setShowCreate(true)
  }

  const resetForm = () => { setDescription(''); setPhotos([]); setSelectedCampusId(authUser?.campusId ?? null) }

  const handlePickPhoto = (fromCamera: boolean) => {
    setShowPhotoMenu(false)
    if (fromCamera) {
      launchCamera({ mediaType: 'photo', quality: 0.8, includeBase64: true }, res => {
        const asset = res.assets?.[0]
        if (asset?.uri && asset.base64) {
          setPhotos(prev => {
            const remaining = 5 - prev.length
            if (remaining <= 0) return prev
            return [...prev, { uri: asset.uri!, base64: asset.base64! }]
          })
        }
      })
    } else {
      launchImageLibrary({ mediaType: 'photo', quality: 0.8, includeBase64: true, selectionLimit: 5 }, res => {
        const assets = res.assets ?? []
        if (assets.length === 0) return
        setPhotos(prev => {
          const remaining = 5 - prev.length
          const newAssets = assets
            .filter(a => a.uri && a.base64)
            .slice(0, remaining)
            .map(a => ({ uri: a.uri!, base64: a.base64! }))
          return [...prev, ...newAssets]
        })
      })
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreate = () => {
    if (!description.trim()) {
      Alert.alert('Required', 'Description is required. Please describe your work.')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirm(false)
    const d = new Date()
    setSaving(true)
    try {
      await attendanceService.createDailyWork({
        year:          d.getFullYear(),
        month:         d.getMonth() + 1,
        day:           d.getDate(),
        time:          d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        description:   description.trim(),
        photos_base64: photos.length > 0 ? photos.map(p => p.base64) : undefined,
        campus_id:     selectedCampusId ?? undefined,
      })
      setShowCreate(false)
      resetForm()
      load(true)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to submit.')
    } finally { setSaving(false) }
  }

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (year === now.getFullYear() && month === now.getMonth() + 1) return
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const renderItem = ({ item }: { item: DailyWork }) => {
    const st = STATUS_STYLE[item.status ?? 'pending'] ?? STATUS_STYLE.pending
    const photoPath = item.photos?.[0]?.photoPath ?? item.photoPath
    const dateStr = getDateStr(item, year)
    const approverName = item.approver?.fullName ?? item.approver?.email ?? null

    return (
      <View style={styles.row}>
        {/* Thumbnail */}
        {photoPath ? (
          <Image source={{ uri: `${SERVER_URL}${photoPath}` }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={styles.thumbFallback}>
            <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
          </View>
        )}

        {/* Content */}
        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={styles.rowDate}>{dateStr}</Text>
            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
              <FontAwesome5 iconStyle="solid" name={st.icon as any} size={10} color={st.text} />
              <Text style={[styles.statusTxt, { color: st.text }]}>{item.status ?? 'pending'}</Text>
            </View>
          </View>
          {item.time ? <Text style={styles.rowTime}>{item.time}</Text> : null}
          {item.description ? <Text style={styles.rowNote} numberOfLines={2}>{item.description}</Text> : null}
          {approverName && item.status !== 'pending' ? (
            <View style={styles.approverRow}>
              <FontAwesome5 iconStyle="solid" name="check-double" size={11} color={st.text} />
              <Text style={[styles.approverTxt, { color: st.text }]} numberOfLines={1}>{approverName}</Text>
            </View>
          ) : null}
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Daily Work</Text>
          <Text style={styles.headerSub}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <FontAwesome5 iconStyle="solid" name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Month selector */}
      <View style={styles.monthRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthArrow}>
          <FontAwesome5 iconStyle="solid" name="chevron-left" size={20} color="#6366F1" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{MONTHS[month - 1]} {year}</Text>
        <TouchableOpacity
          onPress={nextMonth}
          style={[styles.monthArrow, isCurrentMonth && styles.monthArrowDisabled]}
          disabled={isCurrentMonth}
        >
          <FontAwesome5 iconStyle="solid" name="chevron-right" size={20} color={isCurrentMonth ? '#CBD5E1' : '#6366F1'} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <FontAwesome5 iconStyle="solid" name="search" size={16} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, note, date…"
          placeholderTextColor="#94A3B8"
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <FontAwesome5 iconStyle="solid" name="times-circle" size={16} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#6366F1" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={filtered.length > 0 ? styles.listFilled : styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true) }}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <FontAwesome5 iconStyle="solid" name="briefcase" size={40} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyTitle}>
                {search ? 'No results found' : 'No records this month'}
              </Text>
              {!search && (
                <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreate}>
                  <FontAwesome5 iconStyle="solid" name="plus-circle" size={16} color="#fff" />
                  <Text style={styles.emptyAddTxt}>Add Daily Work</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Create Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        onRequestClose={() => { setShowCreate(false); resetForm() }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.formSheet}
            contentContainerStyle={{ paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Daily Work</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetForm() }} style={styles.formClose}>
                <FontAwesome5 iconStyle="solid" name="times" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Campus</Text>
            <TouchableOpacity style={styles.campusPicker} onPress={() => setShowCampusPicker(v => !v)} activeOpacity={0.7}>
              <View style={styles.campusPickerIcon}>
                <FontAwesome5 iconStyle="solid" name="building" size={18} color="#6366F1" />
              </View>
              <Text style={[styles.campusPickerTxt, !selectedCampusId && styles.campusPickerPlaceholder]}>
                {selectedCampusId
                  ? (campuses.find(c => c.id === selectedCampusId)?.fullName ?? 'Select campus…')
                  : 'Select campus…'}
              </Text>
              <FontAwesome5 iconStyle="solid" name={showCampusPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showCampusPicker && (
              <View style={styles.campusDropdown}>
                {campuses.map((c, i) => (
                  <React.Fragment key={c.id}>
                    {i > 0 && <View style={styles.campusDropdownSep} />}
                    <TouchableOpacity
                      style={styles.campusDropdownItem}
                      onPress={() => { setSelectedCampusId(c.id); setShowCampusPicker(false) }}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.campusDropdownItemIcon, selectedCampusId === c.id && styles.campusDropdownItemIconActive]}>
                        <FontAwesome5 iconStyle="solid" name="building" size={16} color={selectedCampusId === c.id ? '#fff' : '#6366F1'} />
                      </View>
                      <Text style={[styles.campusDropdownItemTxt, selectedCampusId === c.id && styles.campusDropdownItemTxtActive]}>
                        {c.fullName}
                      </Text>
                      {selectedCampusId === c.id && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
                {campuses.length === 0 && (
                  <Text style={styles.campusDropdownEmpty}>No campuses available</Text>
                )}
              </View>
            )}

            <Text style={styles.label}>Work Photos (optional)</Text>
            <View style={styles.photoGrid}>
              {photos.map((p, i) => (
                <View key={i} style={styles.photoThumbWrap}>
                  <Image source={{ uri: p.uri }} style={styles.photoThumb} resizeMode="cover" />
                  <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(i)}>
                    <FontAwesome5 iconStyle="solid" name="times-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity style={styles.photoAddTile} onPress={() => setShowPhotoMenu(true)}>
                  <FontAwesome5 iconStyle="solid" name="images" size={44} color="#6366F1" />
                  <Text style={styles.photoAddTxt}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your work today…"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnTxt}>Submit</Text>}
            </TouchableOpacity>
          </ScrollView>

          {/* Confirm alert — inline overlay inside the modal */}
          <ConfirmAlert
            visible={showConfirm}
            onConfirm={handleConfirmSubmit}
            onCancel={() => setShowConfirm(false)}
          />

          {/* Photo source menu — inline overlay inside the modal */}
          {showPhotoMenu && (
            <TouchableOpacity
              style={[styles.overlay, StyleSheet.absoluteFill]}
              activeOpacity={1}
              onPress={() => setShowPhotoMenu(false)}
            >
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={styles.photoMenu}>
                  <Text style={styles.photoMenuTitle}>Add Work Photo</Text>
                  <TouchableOpacity style={styles.photoMenuItem} onPress={() => handlePickPhoto(true)} activeOpacity={0.7}>
                    <View style={[styles.photoMenuIcon, { backgroundColor: '#EEF2FF' }]}>
                      <FontAwesome5 iconStyle="solid" name="camera" size={22} color="#6366F1" />
                    </View>
                    <Text style={styles.photoMenuLabel}>Take Photo</Text>
                    <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                  <View style={styles.menuSep} />
                  <TouchableOpacity style={styles.photoMenuItem} onPress={() => handlePickPhoto(false)} activeOpacity={0.7}>
                    <View style={[styles.photoMenuIcon, { backgroundColor: '#D1FAE5' }]}>
                      <FontAwesome5 iconStyle="solid" name="images" size={22} color="#10B981" />
                    </View>
                    <Text style={styles.photoMenuLabel}>Upload from Gallery</Text>
                    <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

        </KeyboardAvoidingView>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  monthArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  monthArrowDisabled: { backgroundColor: '#F1F5F9' },
  monthLabel: { fontSize: 15, fontWeight: '800', color: '#1E293B', minWidth: 110, textAlign: 'center' },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, fontSize: 14, color: '#1E293B', padding: 0 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 24 },
  listFilled: { paddingBottom: 24, backgroundColor: '#fff', marginHorizontal: 12, marginTop: 4, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  rowBody: { flex: 1 },
  separator: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 80 },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  thumbFallback: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFEDD5', alignItems: 'center', justifyContent: 'center' },

  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 1 },
  rowDate: { fontSize: 13, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  rowTime: { fontSize: 11, color: '#94A3B8', marginBottom: 1 },
  rowNote: { fontSize: 12, color: '#64748B', lineHeight: 16, marginTop: 2 },

  approverRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  approverTxt: { fontSize: 11, fontWeight: '600' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  emptyAddTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  formSheet: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 40 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  formClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 16, marginBottom: 6 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4, justifyContent: 'center' },
  photoThumbWrap: { width: 96, height: 96, borderRadius: 14, overflow: 'hidden', position: 'relative', backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#E2E8F0' },
  photoThumb: { width: '100%', height: '100%' },
  photoRemoveBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12 },
  photoAddTile: { width: 192, height: 192, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: '#A5B4FC', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F5F3FF' },
  photoAddTxt: { fontSize: 14, fontWeight: '700', color: '#6366F1' },

  input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1.5, borderColor: '#E2E8F0' },
  textArea: { minHeight: 100, paddingTop: 12 },

  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Campus inline dropdown
  campusPicker: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  campusPickerIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  campusPickerTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },
  campusPickerPlaceholder: { color: '#94A3B8', fontWeight: '400' },
  campusDropdown: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 4, overflow: 'hidden' },
  campusDropdownSep: { height: 1, backgroundColor: '#F1F5F9' },
  campusDropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  campusDropdownItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  campusDropdownItemIconActive: { backgroundColor: '#6366F1' },
  campusDropdownItemTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },
  campusDropdownItemTxtActive: { color: '#6366F1' },
  campusDropdownEmpty: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 16 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  photoMenu: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, gap: 4 },
  photoMenuTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  photoMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  photoMenuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  photoMenuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E293B' },
  menuSep: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
})

const ca = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  card:         { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  iconBox:      { width: 68, height: 68, borderRadius: 34, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title:        { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  body:         { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  btnRow:       { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  btnCancel:    { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  btnCancelTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  btnConfirm:   { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
  btnConfirmTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
