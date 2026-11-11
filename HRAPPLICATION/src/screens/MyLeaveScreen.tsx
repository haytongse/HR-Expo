import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Image, Animated, Dimensions,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import DateTimePicker from '@react-native-community/datetimepicker'
import { launchImageLibrary } from 'react-native-image-picker'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { leaveService, LeaveType } from '../services/leaveService'
import { UserPermission } from '../models'
import { SERVER_URL } from '../services/api'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#F59E0B' },
  approved: { bg: '#D1FAE5', text: '#10B981' },
  rejected: { bg: '#FEE2E2', text: '#EF4444' },
}

const TYPE_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  leave:      { icon: 'umbrella',       bg: '#EEF2FF', color: '#6366F1' },
  sick:       { icon: 'medkit',          bg: '#FEE2E2', color: '#EF4444' },
  permission: { icon: 'file-alt',  bg: '#D1FAE5', color: '#10B981' },
}

type LeaveFilter = 'all' | 'pending' | 'approved' | 'rejected'
const FILTERS: LeaveFilter[] = ['all', 'pending', 'approved', 'rejected']

function ConfirmAlert({
  visible,
  days,
  typeName,
  onConfirm,
  onCancel,
}: {
  visible: boolean
  days: number
  typeName: string
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
  }, [visible, scale])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={ca.overlay}>
        <Animated.View style={[ca.card, { transform: [{ scale }] }]}>
          <View style={ca.iconBox}>
            <FontAwesome5 iconStyle="solid" name="calendar-alt" size={32} color="#6366F1" />
          </View>
          <Text style={ca.title}>Confirm Request</Text>
          <Text style={ca.body}>
            Submit <Text style={ca.bold}>{days} day{days !== 1 ? 's' : ''}</Text> of{'\n'}
            <Text style={ca.bold}>{typeName}</Text>?
          </Text>
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
    </Modal>
  )
}

export default function MyLeaveScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()

  const [allItems, setAllItems]     = useState<UserPermission[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter]         = useState<LeaveFilter>('all')

  // Leave types from API
  const [leaveTypes, setLeaveTypes]         = useState<LeaveType[]>([])
  const [showTypePicker, setShowTypePicker] = useState(false)

  // Create form
  const [showCreate, setShowCreate]         = useState(false)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null)
  const [startDate, setStartDate]           = useState<Date>(new Date())
  const [endDate, setEndDate]               = useState<Date>(new Date())
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker]     = useState(false)
  const [reason, setReason]             = useState('')
  const [photos, setPhotos]             = useState<string[]>([])
  const [photosBase64, setPhotosBase64] = useState<string[]>([])
  const [saving, setSaving]             = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [viewImages, setViewImages]     = useState<string[] | null>(null)
  const [imageIndex, setImageIndex]     = useState(0)

  // Fetch all items once; filter client-side (backend doesn't support status param)
  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await leaveService.getMyLeaves()
      setAllItems(data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  const items = filter === 'all' ? allItems : allItems.filter(i => i.status === filter)

  useFocusEffect(useCallback(() => { load() }, [load]))

  const openCreate = () => {
    leaveService.getLeaveTypes().then(data => {
      setLeaveTypes(data)
      setSelectedTypeId(data[0]?.id ?? null)
    }).catch(() => {})
    setShowCreate(true)
  }

  const resetForm = () => {
    setSelectedTypeId(leaveTypes[0]?.id ?? null)
    setStartDate(new Date())
    setEndDate(new Date())
    setReason('')
    setPhotos([])
    setPhotosBase64([])
  }

  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, includeBase64: true, selectionLimit: 3 }, res => {
      const assets = res.assets ?? []
      const uris: string[] = []; const b64s: string[] = []
      for (const a of assets) { if (a?.uri && a.base64) { uris.push(a.uri); b64s.push(a.base64) } }
      if (uris.length) { setPhotos(p => [...p, ...uris]); setPhotosBase64(p => [...p, ...b64s]) }
    })
  }

  const handleCreate = () => {
    if (endDate < startDate) {
      Alert.alert('Invalid Dates', 'End date cannot be before start date.')
      return
    }
    if (!selectedTypeId) {
      Alert.alert('Select Type', 'Please select a leave type.')
      return
    }
    if (!reason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for your leave request.')
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmSubmit = async () => {
    setShowConfirm(false)
    setSaving(true)
    try {
      await leaveService.createLeave({
        leave_type_id: selectedTypeId!,
        start_date: toDateStr(startDate),
        end_date: toDateStr(endDate),
        reason: reason.trim(),
        photos_base64: photosBase64.length > 0 ? photosBase64 : undefined,
      })
      setShowCreate(false)
      resetForm()
      load(true)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to submit request.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = (item: UserPermission) => {
    if (item.status !== 'pending') return
    Alert.alert('Cancel Request', 'Cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await leaveService.cancelLeave(item.id)
            setAllItems(p => p.filter(i => i.id !== item.id))
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message || 'Failed to cancel.')
          }
        },
      },
    ])
  }

  const daysBetween = (a: Date, b: Date) =>
    Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1)

  const openImages = (item: UserPermission, startIdx = 0) => {
    const urls = (item.photos ?? []).map(ph => `${SERVER_URL}${ph.photoPath}`)
    if (item.photoPath && urls.length === 0) urls.push(`${SERVER_URL}${item.photoPath}`)
    if (urls.length === 0) return
    setImageIndex(startIdx < urls.length ? startIdx : 0)
    setViewImages(urls)
  }

  const renderItem = ({ item, index }: { item: UserPermission; index: number }) => {
    const col   = STATUS_COLORS[item.status] ?? { bg: '#F1F5F9', text: '#64748B' }
    const ti    = TYPE_ICONS[item.type]      ?? TYPE_ICONS.permission
    const days  = item.amountDay ?? daysBetween(new Date(item.startDate), new Date(item.endDate))
    const photos = [
      ...(item.photos ?? []).map(ph => `${SERVER_URL}${ph.photoPath}`),
      ...(item.photoPath && !(item.photos?.length) ? [`${SERVER_URL}${item.photoPath}`] : []),
    ]
    const firstPhoto = photos[0]
    const isLast = index === items.length - 1

    return (
      <View style={[st.row, !isLast && st.rowBorder]}>
        {/* Photo or type icon */}
        <TouchableOpacity
          onPress={() => openImages(item)}
          disabled={photos.length === 0}
          activeOpacity={0.8}
          style={st.thumbWrap}
        >
          {firstPhoto ? (
            <Image source={{ uri: firstPhoto }} style={st.thumb} resizeMode="cover" />
          ) : (
            <View style={[st.thumbFallback, { backgroundColor: ti.bg }]}>
              <FontAwesome5 iconStyle="solid" name={ti.icon} size={22} color={ti.color} />
            </View>
          )}
          {photos.length > 1 && (
            <View style={st.photoBadge}>
              <Text style={st.photoBadgeTxt}>{photos.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={st.rowTop}>
            <Text style={st.rowType} numberOfLines={1}>
              {(item as any).leaveType?.name ?? item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
            <View style={[st.statusBadge, { backgroundColor: col.bg }]}>
              <Text style={[st.statusTxt, { color: col.text }]}>{item.status}</Text>
            </View>
          </View>
          <Text style={st.rowDate}>
            {fmtDate(item.startDate)}{item.startDate !== item.endDate ? ` – ${fmtDate(item.endDate)}` : ''}
          </Text>
          <View style={st.rowMeta}>
            <View style={st.metaChip}>
              <FontAwesome5 iconStyle="solid" name="clock" size={10} color="#64748B" />
              <Text style={st.metaChipTxt}>{days} day{days !== 1 ? 's' : ''}</Text>
            </View>
            {item.reason ? <Text style={st.reasonTxt} numberOfLines={1}>{item.reason}</Text> : null}
          </View>
          {item.notes ? (
            <View style={st.notesBox}>
              <FontAwesome5 iconStyle="solid" name="comment" size={10} color="#6366F1" />
              <Text style={st.notesTxt} numberOfLines={2}>{item.notes}</Text>
            </View>
          ) : null}
          {item.status === 'pending' && (
            <TouchableOpacity style={st.cancelBtn} onPress={() => handleCancel(item)}>
              <FontAwesome5 iconStyle="solid" name="times-circle" size={13} color="#EF4444" />
              <Text style={st.cancelBtnTxt}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

  return (
    <View style={st.container}>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>My Leave</Text>
          <Text style={st.headerSub}>{items.length} request{items.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity style={st.addBtn} onPress={openCreate}>
          <FontAwesome5 iconStyle="solid" name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={st.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[st.filterBtn, filter === f && st.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[st.filterTxt, filter === f && st.filterTxtActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={st.center}><ActivityIndicator size="large" color="#6366F1" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true) }}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          ListEmptyComponent={
            <View style={st.empty}>
              <View style={st.emptyIcon}>
                <FontAwesome5 iconStyle="solid" name="file-alt" size={40} color="#CBD5E1" />
              </View>
              <Text style={st.emptyTitle}>No requests yet</Text>
              <TouchableOpacity style={st.emptyAddBtn} onPress={openCreate}>
                <FontAwesome5 iconStyle="solid" name="plus-circle" size={16} color="#fff" />
                <Text style={st.emptyAddTxt}>Request Leave</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* Image viewer */}
      <Modal visible={!!viewImages} transparent animationType="fade" onRequestClose={() => setViewImages(null)}>
        <View style={st.imgViewerBg}>
          <TouchableOpacity style={st.imgViewerClose} onPress={() => setViewImages(null)}>
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
                <View style={st.imgDots}>
                  {viewImages.map((_, i) => (
                    <View key={i} style={[st.imgDot, i === imageIndex && st.imgDotActive]} />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </Modal>

      {/* Create Modal */}
      <Modal
        visible={showCreate}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => { setShowCreate(false); resetForm() }}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={st.formSheet}
            contentContainerStyle={{ paddingBottom: 48 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={st.formHeader}>
              <Text style={st.formTitle}>Request Leave</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetForm() }} style={st.formClose}>
                <FontAwesome5 iconStyle="solid" name="times" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Leave Type */}
            <Text style={st.label}>Type <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TouchableOpacity
              style={st.typePicker}
              onPress={() => setShowTypePicker(v => !v)}
              activeOpacity={0.7}
            >
              <View style={st.typePickerIcon}>
                <FontAwesome5 iconStyle="solid" name="file-alt" size={18} color="#6366F1" />
              </View>
              <Text style={[st.typePickerTxt, !selectedTypeId && st.typePickerPlaceholder]}>
                {selectedTypeId
                  ? (leaveTypes.find(t => t.id === selectedTypeId)?.name ?? 'Select type…')
                  : 'Select type…'}
              </Text>
              <FontAwesome5 iconStyle="solid" name={showTypePicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showTypePicker && (
              <View style={st.typeDropdown}>
                {leaveTypes.map((t, i) => (
                  <React.Fragment key={t.id}>
                    {i > 0 && <View style={st.typePickerSep} />}
                    <TouchableOpacity
                      style={st.typePickerItem}
                      onPress={() => { setSelectedTypeId(t.id); setShowTypePicker(false) }}
                      activeOpacity={0.7}
                    >
                      <View style={[st.typePickerItemIcon, selectedTypeId === t.id && st.typePickerItemIconActive]}>
                        <FontAwesome5 iconStyle="solid" name="file-alt" size={16} color={selectedTypeId === t.id ? '#fff' : '#6366F1'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[st.typePickerItemTxt, selectedTypeId === t.id && st.typePickerItemTxtActive]}>
                          {t.name}
                        </Text>
                        {t.description ? <Text style={st.typePickerItemSub} numberOfLines={1}>{t.description}</Text> : null}
                      </View>
                      {selectedTypeId === t.id && <FontAwesome5 iconStyle="solid" name="check" size={16} color="#6366F1" />}
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
                {leaveTypes.length === 0 && (
                  <Text style={st.typePickerEmpty}>No leave types available</Text>
                )}
              </View>
            )}

            {/* Start Date */}
            <Text style={st.label}>Start Date <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TouchableOpacity style={st.dateSelector} onPress={() => { setShowStartPicker(v => !v); setShowEndPicker(false) }}>
              <View style={st.dateSelectorIcon}>
                <FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color="#6366F1" />
              </View>
              <Text style={st.dateSelectorTxt}>{fmtDate(toDateStr(startDate))}</Text>
              <FontAwesome5 iconStyle="solid" name={showStartPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showStartPicker && (
              <View style={st.inlinePicker}>
                <DateTimePicker
                  mode="date"
                  value={startDate}
                  display="spinner"
                  textColor="#1E293B"
                  onValueChange={(_e, d) => { if (d) { setStartDate(d); if (d > endDate) setEndDate(d) } }}
                  style={{ width: '100%', height: 180 }}
                />
                <TouchableOpacity style={st.pickerDone} onPress={() => setShowStartPicker(false)}>
                  <Text style={st.pickerDoneTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* End Date */}
            <Text style={st.label}>End Date <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TouchableOpacity style={st.dateSelector} onPress={() => { setShowEndPicker(v => !v); setShowStartPicker(false) }}>
              <View style={st.dateSelectorIcon}>
                <FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color="#6366F1" />
              </View>
              <Text style={st.dateSelectorTxt}>{fmtDate(toDateStr(endDate))}</Text>
              <FontAwesome5 iconStyle="solid" name={showEndPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
            </TouchableOpacity>
            {showEndPicker && (
              <View style={st.inlinePicker}>
                <DateTimePicker
                  mode="date"
                  value={endDate}
                  display="spinner"
                  textColor="#1E293B"
                  minimumDate={startDate}
                  onValueChange={(_e, d) => { if (d) setEndDate(d) }}
                  style={{ width: '100%', height: 180 }}
                />
                <TouchableOpacity style={st.pickerDone} onPress={() => setShowEndPicker(false)}>
                  <Text style={st.pickerDoneTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={st.daysHint}>
              <Text style={st.daysHintCount}>{daysBetween(startDate, endDate)}</Text>
              <Text style={st.daysHintLabel}>day{daysBetween(startDate, endDate) !== 1 ? 's' : ''}</Text>
            </View>

            {/* Reason */}
            <Text style={st.label}>Reason <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TextInput
              style={[st.input, st.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="Describe the reason for your leave…"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Attachments */}
            <Text style={st.label}>Attachments (optional)</Text>
            <View style={st.photoGrid}>
              {photos.map((uri, i) => (
                <View key={i} style={st.photoThumbWrap}>
                  <Image source={{ uri }} style={st.photoThumb} resizeMode="cover" />
                  <TouchableOpacity
                    style={st.photoRemoveBtn}
                    onPress={() => {
                      setPhotos(p => p.filter((_, idx) => idx !== i))
                      setPhotosBase64(p => p.filter((_, idx) => idx !== i))
                    }}
                  >
                    <FontAwesome5 iconStyle="solid" name="times-circle" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity style={st.photoAddTile} onPress={handlePickPhoto}>
                  <FontAwesome5 iconStyle="solid" name="images" size={44} color="#6366F1" />
                  <Text style={st.photoAddTxt}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[st.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={st.saveBtnTxt}>Submit Request</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <ConfirmAlert
          visible={showConfirm}
          days={daysBetween(startDate, endDate)}
          typeName={leaveTypes.find(t => t.id === selectedTypeId)?.name ?? 'Leave'}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      </Modal>
    </View>
  )
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: { backgroundColor: '#6366F1', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  filterBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  filterTxt: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  filterTxtActive: { color: '#6366F1' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingBottom: 40, backgroundColor: '#fff' },

  // Flat list rows
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  rowType: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E293B', marginRight: 8 },
  rowDate: { fontSize: 12, color: '#64748B', marginBottom: 5 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },

  // Photo thumbnail
  thumbWrap: { position: 'relative' },
  thumb: { width: 52, height: 52, borderRadius: 12 },
  thumbFallback: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  photoBadge: { position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  photoBadgeTxt: { fontSize: 9, fontWeight: '800', color: '#fff' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },

  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  metaChipTxt: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  reasonTxt: { flex: 1, fontSize: 11, color: '#94A3B8' },

  notesBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginTop: 5 },
  notesTxt: { flex: 1, fontSize: 11, color: '#6366F1', lineHeight: 15 },

  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#FEE2E2', marginTop: 6 },
  cancelBtnTxt: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Image viewer
  imgViewerBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  imgViewerClose: { position: 'absolute', top: 52, right: 20, zIndex: 10 },
  imgDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 16 },
  imgDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  imgDotActive: { backgroundColor: '#fff', width: 18 },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  emptyAddTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  formSheet: { flex: 1, backgroundColor: '#fff', padding: 20 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  formClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginTop: 16, marginBottom: 6 },

  typePicker: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  typePickerIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  typePickerTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },
  typePickerPlaceholder: { color: '#94A3B8', fontWeight: '400' },
  typePickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36 },
  typePickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  typePickerItemIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  typePickerItemIconActive: { backgroundColor: '#6366F1' },
  typePickerItemTxt: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  typePickerItemTxtActive: { color: '#6366F1' },
  typePickerItemSub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  typePickerSep: { height: 1, backgroundColor: '#F1F5F9' },
  typePickerEmpty: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 16 },

  dateSelector: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  dateSelectorIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  dateSelectorTxt: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },

  daysHint: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginVertical: 6, backgroundColor: '#EEF2FF', borderRadius: 16, borderWidth: 1.5, borderColor: '#C7D2FE' },
  daysHintCount: { fontSize: 52, fontWeight: '900', color: '#6366F1', lineHeight: 56, textAlign: 'center' },
  daysHintLabel: { fontSize: 16, fontWeight: '700', color: '#818CF8', textAlign: 'center', marginTop: 2 },

  input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1.5, borderColor: '#E2E8F0' },
  textArea: { minHeight: 100, paddingTop: 12 },

  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  photoBtnTxt: { flex: 1, fontSize: 14, fontWeight: '600', color: '#6366F1' },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4, justifyContent: 'center' },
  photoThumbWrap: { width: 96, height: 96, borderRadius: 14, overflow: 'hidden', position: 'relative', backgroundColor: '#E2E8F0', borderWidth: 1, borderColor: '#E2E8F0' },
  photoThumb: { width: '100%', height: '100%' },
  photoRemoveBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 12 },
  photoAddTile: { width: 192, height: 192, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: '#A5B4FC', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F5F3FF' },
  photoAddTxt: { fontSize: 14, fontWeight: '700', color: '#6366F1' },
  typeDropdown: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 4, overflow: 'hidden' },
  inlinePicker: { backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', overflow: 'hidden', marginTop: 6 },

  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  pickerHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  pickerTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  pickerDone: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 4 },
  pickerDoneTxt: { fontSize: 15, fontWeight: '700', color: '#6366F1' },
})

const ca = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  card:       { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  iconBox:    { width: 68, height: 68, borderRadius: 34, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  title:      { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  body:       { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  bold:       { fontWeight: '800', color: '#1E293B' },
  btnRow:     { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  btnCancel:  { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  btnCancelTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  btnConfirm: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
  btnConfirmTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
})
