import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, ActivityIndicator, RefreshControl, Image,
  ScrollView, KeyboardAvoidingView, useWindowDimensions, Platform,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { announcementService, type Announcement } from '../services/announcementService'
import { RootState } from '../store'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000

function toLocalDate(iso: string): Date {
  return new Date(new Date(iso).getTime() + TZ_OFFSET_MS)
}
function formatDate(iso: string) {
  const d = toLocalDate(iso)
  return `${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
function formatSchedule(iso: string) {
  const d = toLocalDate(iso)
  return `${String(d.getUTCDate()).padStart(2,'0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}  ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`
}

export default function AnnouncementsScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { width: W } = useWindowDimensions()
  const { user } = useSelector((s: RootState) => s.auth)
  const isAdmin = user?.role === 'admin'

  const [items, setItems]           = useState<Announcement[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [showCreate, setShowCreate]       = useState(false)
  const [title, setTitle]                 = useState('')
  const [body, setBody]                   = useState('')
  const [schedDate, setSchedDate]         = useState<Date | null>(null)
  const [schedTime, setSchedTime]         = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [photos, setPhotos]               = useState<string[]>([])
  const [photosBase64, setPhotosBase64]   = useState<string[]>([])
  const [showPhotoMenu, setShowPhotoMenu] = useState(false)
  const [saving, setSaving]               = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState<Announcement | null>(null)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [galleryIdx, setGalleryIdx]       = useState(0)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = isAdmin ? await announcementService.adminGetAll() : await announcementService.getAll()
      setItems(data)
    }
    catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [isAdmin])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const resetCreate = () => {
    setTitle(''); setBody(''); setSchedDate(null); setSchedTime(null)
    setPhotos([]); setPhotosBase64([])
  }

  const handleTakePhoto = () => {
    setShowPhotoMenu(false)
    launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false, includeBase64: true }, res => {
      const a = res.assets?.[0]
      if (a?.uri && a.base64) {
        setPhotos(p => [...p, a.uri!])
        setPhotosBase64(p => [...p, a.base64!])
      }
    })
  }

  const handlePickPhoto = () => {
    setShowPhotoMenu(false)
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, includeBase64: true, selectionLimit: 0 }, res => {
      const assets = res.assets ?? []
      const uris: string[] = []; const b64s: string[] = []
      for (const a of assets) { if (a?.uri && a.base64) { uris.push(a.uri); b64s.push(a.base64) } }
      if (uris.length) { setPhotos(p => [...p, ...uris]); setPhotosBase64(p => [...p, ...b64s]) }
    })
  }

  const removePhoto = (idx: number) => {
    setPhotos(p => p.filter((_, i) => i !== idx))
    setPhotosBase64(p => p.filter((_, i) => i !== idx))
  }

  const buildScheduledAt = (): string | null => {
    if (!schedDate) return null
    const h = schedTime ? schedTime.getHours() : 0
    const m = schedTime ? schedTime.getMinutes() : 0
    const yyyy = schedDate.getFullYear()
    const mm   = String(schedDate.getMonth() + 1).padStart(2, '0')
    const dd   = String(schedDate.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00+07:00`
  }

  const dateLabel = schedDate
    ? `${String(schedDate.getDate()).padStart(2,'0')} ${MONTHS[schedDate.getMonth()]} ${schedDate.getFullYear()}`
    : 'Set date'
  const timeLabel = schedTime
    ? `${String(schedTime.getHours()).padStart(2,'0')}:${String(schedTime.getMinutes()).padStart(2,'0')}`
    : 'Set time'

  const handleCreate = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await announcementService.create({
        title: title.trim(),
        body: body.trim() || undefined,
        scheduled_at: buildScheduledAt(),
        photos_base64: photosBase64,
      })
      setShowCreate(false); resetCreate(); load(true)
    } catch {}
    finally { setSaving(false) }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await announcementService.remove(deleteTarget.id)
      setItems(p => p.filter(a => a.id !== deleteTarget.id))
    } catch {}
    finally { setDeleteTarget(null) }
  }

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => {
    const uris = item.photos.map(p => announcementService.photoUrl(p.photoPath))
    const isFirst = index === 0
    const isLast  = index === items.length - 1
    return (
      <TouchableOpacity
        style={[st.row, !isLast && st.rowDivider, isFirst && st.rowFirst, isLast && st.rowLast]}
        onPress={() => uris.length > 0 ? (setGalleryPhotos(uris), setGalleryIdx(0)) : null}
        activeOpacity={uris.length > 0 ? 0.7 : 1}
      >
        {uris[0] ? (
          <View style={st.thumbWrap}>
            <Image source={{ uri: uris[0] }} style={st.thumb} resizeMode="cover" />
            {uris.length > 1 && <View style={st.thumbMore}><Text style={st.thumbMoreTxt}>+{uris.length - 1}</Text></View>}
          </View>
        ) : (
          <View style={st.thumbIcon}><FontAwesome5 iconStyle="solid" name="bullhorn" size={20} color="#6366F1" /></View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={st.rowTitle} numberOfLines={2}>{item.title}</Text>
          {item.scheduledAt && (
            <View style={st.rowSchedule}>
              <FontAwesome5 iconStyle="solid" name="calendar-alt" size={10} color="#6366F1" />
              <Text style={st.rowScheduleTxt}>{formatSchedule(item.scheduledAt)}</Text>
            </View>
          )}
          {item.body ? <Text style={st.rowBody} numberOfLines={1}>{item.body}</Text> : null}
          <View style={st.rowMeta}>
            <FontAwesome5 iconStyle="solid" name="user" size={10} color="#94A3B8" />
            <Text style={st.rowPoster}>{item.createdByUser?.fullName || item.createdByUser?.email || 'Admin'}</Text>
            <Text style={st.rowMetaDot}>·</Text>
            <Text style={st.rowDate}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
        {isAdmin && (
          <TouchableOpacity onPress={() => setDeleteTarget(item)} style={st.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 iconStyle="solid" name="trash-alt" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
          <Text style={st.headerTitle}>Announcements</Text>
          <Text style={st.headerSub}>{items.length} posts</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={st.addBtn} onPress={() => setShowCreate(true)}>
            <FontAwesome5 iconStyle="solid" name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={st.center}><ActivityIndicator size="large" color="#6366F1" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={st.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true) }} colors={['#6366F1']} />}
          ListEmptyComponent={
            <View style={st.empty}>
              <FontAwesome5 iconStyle="solid" name="bullhorn" size={48} color="#CBD5E1" />
              <Text style={st.emptyTitle}>No announcements yet</Text>
              {isAdmin && (
                <TouchableOpacity style={st.emptyAddBtn} onPress={() => setShowCreate(true)}>
                  <FontAwesome5 iconStyle="solid" name="plus-circle" size={16} color="#fff" />
                  <Text style={st.emptyAddTxt}>Post Announcement</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setShowCreate(false); resetCreate() }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={st.formSheet} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">

            <View style={st.formHeader}>
              <Text style={st.formTitle}>New Announcement</Text>
              <TouchableOpacity onPress={() => { setShowCreate(false); resetCreate() }} style={st.formClose}>
                <FontAwesome5 iconStyle="solid" name="times" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={st.label}>Title <Text style={{ color: '#EF4444' }}>*</Text></Text>
            <TextInput style={st.input} value={title} onChangeText={setTitle} placeholder="Announcement title" placeholderTextColor="#94A3B8" />

            <Text style={st.label}>Message</Text>
            <TextInput style={[st.input, st.textArea]} value={body} onChangeText={setBody} placeholder="Write your announcement…" placeholderTextColor="#94A3B8" multiline numberOfLines={5} textAlignVertical="top" />

            <Text style={st.label}>Schedule (optional)</Text>
            <TouchableOpacity style={st.timeSelector} onPress={() => setShowDatePicker(true)}>
              <View style={st.timeSelectorIcon}><FontAwesome5 iconStyle="solid" name="calendar-alt" size={18} color={schedDate ? '#6366F1' : '#94A3B8'} /></View>
              <View style={{ flex: 1 }}>
                <Text style={st.timeSelectorLabel}>Publish Date</Text>
                <Text style={[st.timeSelectorValue, !schedDate && { color: '#94A3B8' }]}>{dateLabel}</Text>
              </View>
              {schedDate && (
                <TouchableOpacity onPress={() => { setSchedDate(null); setSchedTime(null) }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <FontAwesome5 iconStyle="solid" name="times-circle" size={18} color="#CBD5E1" />
                </TouchableOpacity>
              )}
              <FontAwesome5 iconStyle="solid" name="chevron-down" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {schedDate && (
              <TouchableOpacity style={[st.timeSelector, { marginTop: 8 }]} onPress={() => setShowTimePicker(true)}>
                <View style={st.timeSelectorIcon}><FontAwesome5 iconStyle="solid" name="clock" size={18} color={schedTime ? '#6366F1' : '#94A3B8'} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={st.timeSelectorLabel}>Publish Time</Text>
                  <Text style={[st.timeSelectorValue, !schedTime && { color: '#94A3B8' }]}>{timeLabel}</Text>
                </View>
                {schedTime && (
                  <TouchableOpacity onPress={() => setSchedTime(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <FontAwesome5 iconStyle="solid" name="times-circle" size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                )}
                <FontAwesome5 iconStyle="solid" name="chevron-down" size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <Text style={st.fieldHint}>Leave empty to publish immediately</Text>

            <View style={st.photoLabelRow}>
              <Text style={st.label}>Photos</Text>
              {photos.length > 0 && <Text style={st.photoCount}>{photos.length} photo{photos.length > 1 ? 's' : ''}</Text>}
            </View>
            {photos.length > 0 ? (
              <View style={st.photoGrid}>
                {photos.map((uri, idx) => (
                  <View key={idx} style={st.photoThumbWrap}>
                    <Image source={{ uri }} style={st.photoThumb} resizeMode="cover" />
                    <TouchableOpacity style={st.photoRemoveBtn} onPress={() => removePhoto(idx)}>
                      <FontAwesome5 iconStyle="solid" name="times-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={st.photoAddMore} onPress={() => setShowPhotoMenu(true)}>
                  <FontAwesome5 iconStyle="solid" name="plus" size={28} color="#6366F1" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={st.photoPlaceholder} onPress={() => setShowPhotoMenu(true)}>
                <View style={st.photoPlaceholderIcon}><FontAwesome5 iconStyle="solid" name="camera" size={28} color="#6366F1" /></View>
                <Text style={st.photoPlaceholderTitle}>Add Photos</Text>
                <Text style={st.photoPlaceholderSub}>You can add multiple photos</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[st.saveBtn, saving && { opacity: 0.6 }]} onPress={handleCreate} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={st.saveBtnTxt}>Post Announcement</Text>}
            </TouchableOpacity>
          </ScrollView>

          {/* Date Picker — inside pageSheet so it appears on top */}
          <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
            <View style={st.menuOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowDatePicker(false)} />
              <View style={st.timePickerSheet}>
                <View style={st.menuHandle} />
                <Text style={st.menuTitle}>Select Date</Text>
                <DateTimePicker mode="date" value={schedDate ?? new Date()} display="spinner" textColor="#1E293B" onValueChange={(_e, d) => { if (d) setSchedDate(d) }} style={{ width: '100%', height: 180 }} />
                <TouchableOpacity style={st.timePickerDone} onPress={() => setShowDatePicker(false)}>
                  <Text style={st.timePickerDoneTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Time Picker — inside pageSheet */}
          <Modal visible={showTimePicker} transparent animationType="fade" onRequestClose={() => setShowTimePicker(false)}>
            <View style={st.menuOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowTimePicker(false)} />
              <View style={st.timePickerSheet}>
                <View style={st.menuHandle} />
                <Text style={st.menuTitle}>Select Time</Text>
                <DateTimePicker mode="time" value={schedTime ?? new Date()} display="spinner" textColor="#1E293B" onValueChange={(_e, d) => { if (d) setSchedTime(d) }} style={{ width: '100%', height: 180 }} />
                <TouchableOpacity style={st.timePickerDone} onPress={() => setShowTimePicker(false)}>
                  <Text style={st.timePickerDoneTxt}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Photo Menu — inside pageSheet */}
          <Modal visible={showPhotoMenu} transparent animationType="fade" onRequestClose={() => setShowPhotoMenu(false)}>
            <View style={st.menuOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowPhotoMenu(false)} />
              <View style={st.photoMenu}>
                <View style={st.menuHandle} />
                <Text style={st.menuTitle}>Add Photo</Text>
                <TouchableOpacity style={st.photoMenuItem} onPress={handleTakePhoto}>
                  <View style={[st.photoMenuIcon, { backgroundColor: '#EEF2FF' }]}><FontAwesome5 iconStyle="solid" name="camera" size={22} color="#6366F1" /></View>
                  <View style={{ flex: 1 }}><Text style={st.photoMenuLabel}>Take Photo</Text><Text style={st.photoMenuSub}>Use camera</Text></View>
                  <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>
                <View style={st.sep} />
                <TouchableOpacity style={st.photoMenuItem} onPress={handlePickPhoto}>
                  <View style={[st.photoMenuIcon, { backgroundColor: '#D1FAE5' }]}><FontAwesome5 iconStyle="solid" name="images" size={22} color="#10B981" /></View>
                  <View style={{ flex: 1 }}><Text style={st.photoMenuLabel}>Upload from Gallery</Text><Text style={st.photoMenuSub}>Choose from your photos</Text></View>
                  <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
                </TouchableOpacity>
                <View style={{ height: 20 }} />
              </View>
            </View>
          </Modal>

        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirm */}
      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={st.overlay}>
          <View style={st.dialog}>
            <View style={st.dialogIcon}><FontAwesome5 iconStyle="solid" name="trash-alt" size={28} color="#EF4444" /></View>
            <Text style={st.dialogTitle}>Delete Announcement?</Text>
            <Text style={st.dialogSub}>"{deleteTarget?.title}" will be permanently removed.</Text>
            <View style={st.dialogBtns}>
              <TouchableOpacity style={st.dlgCancel} onPress={() => setDeleteTarget(null)}>
                <Text style={st.dlgCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.dlgConfirm} onPress={confirmDelete}>
                <Text style={st.dlgConfirmTxt}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gallery */}
      <Modal visible={galleryPhotos.length > 0} transparent animationType="fade" onRequestClose={() => setGalleryPhotos([])}>
        <View style={st.galleryOverlay}>
          <TouchableOpacity style={st.galleryClose} onPress={() => setGalleryPhotos([])}>
            <FontAwesome5 iconStyle="solid" name="times" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: galleryPhotos[galleryIdx] }} style={{ width: W, height: W }} resizeMode="contain" />
          {galleryPhotos.length > 1 && (
            <View style={st.galleryNav}>
              <TouchableOpacity onPress={() => setGalleryIdx(i => Math.max(0, i - 1))} style={st.galleryArrow} disabled={galleryIdx === 0}>
                <FontAwesome5 iconStyle="solid" name="chevron-left" size={24} color={galleryIdx === 0 ? 'rgba(255,255,255,0.3)' : '#fff'} />
              </TouchableOpacity>
              <Text style={st.galleryCounter}>{galleryIdx + 1} / {galleryPhotos.length}</Text>
              <TouchableOpacity onPress={() => setGalleryIdx(i => Math.min(galleryPhotos.length - 1, i + 1))} style={st.galleryArrow} disabled={galleryIdx === galleryPhotos.length - 1}>
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={24} color={galleryIdx === galleryPhotos.length - 1 ? 'rgba(255,255,255,0.3)' : '#fff'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  rowFirst: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  rowLast: { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  thumbWrap: { position: 'relative', width: 56, height: 56, borderRadius: 12, overflow: 'visible', flexShrink: 0 },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#EEF2FF' },
  thumbMore: { position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 5, paddingHorizontal: 3, paddingVertical: 1 },
  thumbMoreTxt: { fontSize: 9, fontWeight: '700', color: '#fff' },
  thumbIcon: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', lineHeight: 20 },
  rowSchedule: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  rowScheduleTxt: { fontSize: 11, fontWeight: '600', color: '#6366F1' },
  rowBody: { fontSize: 12, color: '#64748B', marginTop: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  rowPoster: { fontSize: 11, color: '#6366F1', fontWeight: '600' },
  rowMetaDot: { fontSize: 10, color: '#CBD5E1' },
  rowDate: { fontSize: 11, color: '#94A3B8' },
  deleteBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },
  emptyAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  emptyAddTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
  formSheet: { flex: 1, backgroundColor: '#fff', padding: 20 },
  formHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  formTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  formClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6, marginTop: 16 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#1E293B', borderWidth: 1.5, borderColor: '#E2E8F0' },
  textArea: { minHeight: 110, paddingTop: 12 },
  fieldHint: { fontSize: 11, color: '#94A3B8', marginTop: 6 },
  saveBtn: { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  timeSelector: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', padding: 14 },
  timeSelectorIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  timeSelectorLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  timeSelectorValue: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  photoLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 },
  photoCount: { fontSize: 12, fontWeight: '700', color: '#6366F1', backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbWrap: { position: 'relative', width: 90, height: 90, borderRadius: 12, overflow: 'visible' },
  photoThumb: { width: 90, height: 90, borderRadius: 12 },
  photoRemoveBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 10 },
  photoAddMore: { width: 90, height: 90, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFF' },
  photoPlaceholder: { borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 14, paddingVertical: 36, alignItems: 'center', gap: 6, backgroundColor: '#F8FAFF' },
  photoPlaceholderIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  photoPlaceholderTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  photoPlaceholderSub: { fontSize: 12, color: '#94A3B8' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  timePickerSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 },
  menuHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  menuTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  timePickerDone: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 4 },
  timePickerDoneTxt: { fontSize: 15, fontWeight: '700', color: '#6366F1' },
  photoMenu: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  photoMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  photoMenuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  photoMenuLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  photoMenuSub: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  sep: { height: 1, backgroundColor: '#F1F5F9' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  dialogIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  dialogTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  dialogSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  dialogBtns: { flexDirection: 'row', gap: 10, width: '100%' },
  dlgCancel: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  dlgCancelTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  dlgConfirm: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' },
  dlgConfirmTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  galleryOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  galleryClose: { position: 'absolute', top: 52, right: 20, zIndex: 10 },
  galleryNav: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16 },
  galleryArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  galleryCounter: { fontSize: 14, color: '#fff', fontWeight: '600' },
})
