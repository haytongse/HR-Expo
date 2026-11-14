import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  Image, ActivityIndicator, Alert, Platform, ActionSheetIOS, StatusBar,
  KeyboardAvoidingView, FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { notesService, UserNote } from '../services/notesService'
import { SERVER_URL } from '../services/api'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { useLanguage } from '../i18n/LanguageContext'

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

const NOTE_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899','#14B8A6']
function noteColor(id: number) { return NOTE_COLORS[id % NOTE_COLORS.length] }

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MyNotesScreen() {
  const insets     = useSafeAreaInsets()
  const navigation = useNavigation<any>()
  const { t } = useLanguage()

  const MONTH_NAMES = [
    t('notes_month_jan'), t('notes_month_feb'), t('notes_month_mar'),
    t('notes_month_apr'), t('notes_month_may'), t('notes_month_jun'),
    t('notes_month_jul'), t('notes_month_aug'), t('notes_month_sep'),
    t('notes_month_oct'), t('notes_month_nov'), t('notes_month_dec'),
  ]
  const DAY_SHORT = [
    t('notes_day_sun'), t('notes_day_mon'), t('notes_day_tue'), t('notes_day_wed'),
    t('notes_day_thu'), t('notes_day_fri'), t('notes_day_sat'),
  ]

  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [notes,     setNotes]     = useState<UserNote[]>([])
  const [loading,   setLoading]   = useState(true)
  const [showMonthPicker, setShowMonthPicker] = useState(false)

  // ── Add / Edit modal ──────────────────────────────────────────────────────
  const [showModal,   setShowModal]   = useState(false)
  const [editNote,    setEditNote]    = useState<UserNote | null>(null)
  const [formTitle,   setFormTitle]   = useState('')
  const [formBody,    setFormBody]    = useState('')
  const [formPhoto,   setFormPhoto]   = useState<{ uri: string; base64: string } | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState<number | null>(null)

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async (y: number, m: number) => {
    setLoading(true)
    try { setNotes(await notesService.getMonthNotes(y, m)) }
    catch { setNotes([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(year, month) }, [load, year, month])

  const applyMonth = (y: number, m: number) => {
    setYear(y); setMonth(m)
    setSelectedDay(y === now.getFullYear() && m === now.getMonth() + 1 ? now.getDate() : 1)
    setShowMonthPicker(false)
  }

  const isFutureMonth = year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)

  // ── Calendar grid ─────────────────────────────────────────────────────────
  const { weeks, noteDates } = useMemo(() => {
    const firstDow    = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()
    const cells: (number | null)[] = [
      ...Array(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]
    while (cells.length % 7 !== 0) cells.push(null)
    const rows: (number | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

    const dateSet = new Set(notes.map(n => {
      const d = new Date(n.date)
      return d.getDate()
    }))
    return { weeks: rows, noteDates: dateSet }
  }, [year, month, notes])

  const todayISO = toISO(now.getFullYear(), now.getMonth() + 1, now.getDate())
  const isThisMonth = year === now.getFullYear() && month === now.getMonth() + 1

  // ── Notes for selected day ─────────────────────────────────────────────────
  const selectedISO   = toISO(year, month, selectedDay)
  const selectedNotes = notes.filter(n => n.date.slice(0, 10) === selectedISO)
  const selectedLabel = (() => {
    const d = new Date(year, month - 1, selectedDay)
    return t('notes_date_format', DAY_SHORT[d.getDay()], selectedDay, MONTH_NAMES[month - 1], year)
  })()

  // ── Open add modal ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditNote(null)
    setFormTitle(''); setFormBody(''); setFormPhoto(null)
    setShowModal(true)
  }

  const openEdit = (note: UserNote) => {
    setEditNote(note)
    setFormTitle(note.title ?? '')
    setFormBody(note.body)
    setFormPhoto(null)
    setShowModal(true)
  }

  // ── Photo picker ───────────────────────────────────────────────────────────
  const pickPhoto = () => {
    const handle = (res: any) => {
      const a = res?.assets?.[0]
      if (a?.base64 && a?.uri) setFormPhoto({ uri: a.uri, base64: a.base64 })
    }
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('notes_cancel'), t('profile_camera'), t('profile_gallery')], cancelButtonIndex: 0 },
        idx => {
          if (idx === 1) launchCamera({ mediaType: 'photo', quality: 0.75, includeBase64: true }, handle)
          if (idx === 2) launchImageLibrary({ mediaType: 'photo', quality: 0.75, includeBase64: true }, handle)
        }
      )
    } else {
      Alert.alert(t('notes_add_photo'), '', [
        { text: t('profile_camera'), onPress: () => launchCamera({ mediaType: 'photo', quality: 0.75, includeBase64: true }, handle) },
        { text: t('profile_gallery'), onPress: () => launchImageLibrary({ mediaType: 'photo', quality: 0.75, includeBase64: true }, handle) },
        { text: t('notes_cancel'), style: 'cancel' },
      ])
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!formBody.trim()) { Alert.alert('ទាមទារ', 'សូមបញ្ចូលខ្លឹមសារកំណត់ចំណាំ'); return }
    setSaving(true)
    try {
      const photoB64 = formPhoto ? `data:image/jpeg;base64,${formPhoto.base64}` : undefined
      if (editNote) {
        const updated = await notesService.updateNote(editNote.id, {
          title: formTitle.trim() || undefined,
          body:  formBody.trim(),
          photo_base64: photoB64,
        })
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
      } else {
        const created = await notesService.createNote({
          date:  selectedISO,
          title: formTitle.trim() || undefined,
          body:  formBody.trim(),
          photo_base64: photoB64,
        })
        setNotes(prev => [...prev, created])
      }
      setShowModal(false)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save note')
    } finally { setSaving(false) }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = (note: UserNote) => {
    Alert.alert(t('notes_delete'), '', [
      { text: t('notes_cancel'), style: 'cancel' },
      { text: t('notes_delete'), style: 'destructive', onPress: () => deleteNote(note) },
    ])
  }

  const deleteNote = async (note: UserNote) => {
    setDeleting(note.id)
    try {
      await notesService.deleteNote(note.id)
      setNotes(prev => prev.filter(n => n.id !== note.id))
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to delete note')
    } finally { setDeleting(null) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FontAwesome5 iconStyle="solid" name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t('notes_title')}</Text>
            <Text style={styles.headerSub}>{notes.length} {t('notes_title')}</Text>
          </View>
          <TouchableOpacity style={styles.addHeaderBtn} onPress={openAdd}>
            <FontAwesome5 iconStyle="solid" name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Month selector */}
        <TouchableOpacity style={styles.monthSelector} onPress={() => setShowMonthPicker(true)} activeOpacity={0.8}>
          <TouchableOpacity style={styles.monthArrow} onPress={() => {
            const p = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 }
            applyMonth(p.y, p.m)
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
              const n = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 }
              applyMonth(n.y, n.m)
            }}
            disabled={isFutureMonth}
          >
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Calendar card */}
        <View style={styles.calCard}>
          {/* Day-of-week header */}
          <View style={styles.calDowRow}>
            {DAY_SHORT.map((d, i) => (
              <Text key={d} style={[styles.calDow, i === 0 && { color: '#EF4444' }]}>{d}</Text>
            ))}
          </View>

          {/* Weeks */}
          {loading ? (
            <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color="#6366F1" />
            </View>
          ) : weeks.map((week, wi) => (
            <View key={wi} style={styles.calWeekRow}>
              {week.map((day, di) => {
                if (!day) return <View key={di} style={styles.calCell} />
                const iso       = toISO(year, month, day)
                const isToday   = isThisMonth && day === now.getDate()
                const isSelected = day === selectedDay
                const hasNotes  = noteDates.has(day)
                const isSun     = di === 0

                return (
                  <TouchableOpacity
                    key={di}
                    style={styles.calCell}
                    onPress={() => setSelectedDay(day)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.calCellInner,
                      isSelected && styles.calCellSelected,
                      !isSelected && isToday && styles.calCellToday,
                    ]}>
                      <Text style={[
                        styles.calCellTxt,
                        isSun && !isSelected && { color: '#EF4444' },
                        isSelected && { color: '#fff' },
                        isToday && !isSelected && { color: '#6366F1', fontWeight: '800' },
                      ]}>{day}</Text>
                    </View>
                    {hasNotes && (
                      <View style={[styles.noteDot, isSelected && { backgroundColor: '#fff' }]} />
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </View>

        {/* Selected day notes */}
        <View style={styles.daySection}>
          <View style={styles.daySectionHeader}>
            <View style={styles.daySectionDot} />
            <Text style={styles.daySectionLabel}>{selectedLabel}</Text>
            <TouchableOpacity style={styles.addDayBtn} onPress={openAdd} activeOpacity={0.7}>
              <FontAwesome5 iconStyle="solid" name="plus" size={12} color="#6366F1" />
              <Text style={styles.addDayBtnTxt}>{t('notes_add')}</Text>
            </TouchableOpacity>
          </View>

          {selectedNotes.length === 0 ? (
            <View style={styles.emptyDay}>
              <View style={styles.emptyDayIcon}>
                <FontAwesome5 iconStyle="solid" name="sticky-note" size={28} color="#CBD5E1" />
              </View>
              <Text style={styles.emptyDayTxt}>{t('notes_no_notes')}</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd} activeOpacity={0.8}>
                <FontAwesome5 iconStyle="solid" name="plus" size={14} color="#fff" />
                <Text style={styles.emptyAddBtnTxt}>{t('notes_add_title')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedNotes.map(note => {
              const color = noteColor(note.id)
              const photoUri = note.photoPath ? `${SERVER_URL}${note.photoPath}` : null
              return (
                <View key={note.id} style={styles.noteCard}>
                  {/* Color bar */}
                  <View style={[styles.noteBar, { backgroundColor: color }]} />

                  <View style={styles.noteContent}>
                    {/* Header row */}
                    <View style={styles.noteHeaderRow}>
                      {/* Avatar / photo */}
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={styles.notePhoto} />
                      ) : (
                        <View style={[styles.noteAvatar, { backgroundColor: color + '20' }]}>
                          <Text style={[styles.noteAvatarTxt, { color }]}>
                            {(note.title || note.body).charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}

                      <View style={{ flex: 1 }}>
                        {note.title ? (
                          <Text style={styles.noteTitle} numberOfLines={1}>{note.title}</Text>
                        ) : null}
                        <Text style={styles.noteBody} numberOfLines={photoUri ? 2 : 4}>{note.body}</Text>
                      </View>

                      {/* Actions */}
                      <View style={styles.noteActions}>
                        <TouchableOpacity style={styles.noteActionBtn} onPress={() => openEdit(note)} activeOpacity={0.7}>
                          <FontAwesome5 iconStyle="solid" name="edit" size={14} color="#6366F1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.noteActionBtn, { backgroundColor: '#FEE2E2' }]}
                          onPress={() => confirmDelete(note)}
                          activeOpacity={0.7}
                          disabled={deleting === note.id}
                        >
                          {deleting === note.id
                            ? <ActivityIndicator size="small" color="#EF4444" />
                            : <FontAwesome5 iconStyle="solid" name="trash" size={14} color="#EF4444" />
                          }
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Full image below text if photo */}
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.noteFullPhoto} resizeMode="cover" />
                    ) : null}

                    <Text style={styles.noteTime}>
                      {new Date(note.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              )
            })
          )}
        </View>
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="fade" onRequestClose={() => setShowMonthPicker(false)}>
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerTitle}>{t('notes_select_month')}</Text>
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
                const isActive = mNum === month && year === now.getFullYear() ? true : mNum === month
                const isFut    = year === now.getFullYear() && mNum > now.getMonth() + 1
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.monthCell, isActive && styles.monthCellActive, isFut && styles.monthCellDisabled]}
                    onPress={() => !isFut && applyMonth(year, mNum)}
                    disabled={isFut}
                  >
                    <Text style={[styles.monthCellTxt, isActive && styles.monthCellTxtActive, isFut && { color: '#CBD5E1' }]}>{m}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <TouchableOpacity style={styles.pickerClose} onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.pickerCloseTxt}>{t('notes_close')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add / Edit Note Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editNote ? t('notes_edit_title') : selectedLabel}</Text>
                <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
                  <FontAwesome5 iconStyle="solid" name="times" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {/* Photo area */}
                <TouchableOpacity style={styles.photoArea} onPress={pickPhoto} activeOpacity={0.8}>
                  {formPhoto ? (
                    <Image source={{ uri: formPhoto.uri }} style={styles.photoPreview} resizeMode="cover" />
                  ) : editNote?.photoPath ? (
                    <>
                      <Image source={{ uri: `${SERVER_URL}${editNote.photoPath}` }} style={styles.photoPreview} resizeMode="cover" />
                      <View style={styles.photoOverlay}>
                        <FontAwesome5 iconStyle="solid" name="camera" size={20} color="#fff" />
                        <Text style={styles.photoOverlayTxt}>{t('profile_change_photo')}</Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <View style={styles.photoPlaceholderIcon}>
                        <FontAwesome5 iconStyle="solid" name="image" size={28} color="#CBD5E1" />
                      </View>
                      <Text style={styles.photoPlaceholderTxt}>{t('notes_add_photo')}</Text>
                      <Text style={styles.photoPlaceholderSub}>{t('profile_camera')} / {t('profile_gallery')}</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Title */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('profile_name')} <Text style={{ color: '#CBD5E1', fontWeight: '400' }}>({t('notes_title_placeholder')})</Text></Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formTitle}
                    onChangeText={setFormTitle}
                    placeholder={t('notes_title_placeholder')}
                    placeholderTextColor="#CBD5E1"
                    maxLength={200}
                  />
                </View>

                {/* Body */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{t('notes_title')} <Text style={{ color: '#EF4444' }}>*</Text></Text>
                  <TextInput
                    style={[styles.fieldInput, styles.bodyInput]}
                    value={formBody}
                    onChangeText={setFormBody}
                    placeholder={t('notes_body_placeholder')}
                    placeholderTextColor="#CBD5E1"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </ScrollView>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowModal(false)} activeOpacity={0.8}>
                  <Text style={styles.modalCancelTxt}>{t('notes_cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={save} disabled={saving} activeOpacity={0.8}>
                  {saving
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.modalSaveTxt}>{t('notes_save')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  addHeaderBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  // Month selector
  monthSelector: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  monthPill:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  monthText:  { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Calendar card
  calCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  calDowRow:  { flexDirection: 'row', marginBottom: 4 },
  calDow:     { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#94A3B8', paddingVertical: 4 },
  calWeekRow: { flexDirection: 'row' },
  calCell:    { flex: 1, alignItems: 'center', paddingVertical: 4, minHeight: 52, justifyContent: 'flex-start', paddingTop: 4 },
  calCellInner: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  calCellSelected: { backgroundColor: '#6366F1' },
  calCellToday:    { borderWidth: 2, borderColor: '#6366F1' },
  calCellTxt: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  noteDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: '#6366F1', marginTop: 1 },

  // Day section
  daySection: { marginHorizontal: 16, marginTop: 16 },
  daySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  daySectionDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6366F1' },
  daySectionLabel:  { flex: 1, fontSize: 15, fontWeight: '700', color: '#1E293B' },
  addDayBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  addDayBtnTxt: { fontSize: 13, fontWeight: '700', color: '#6366F1' },

  // Empty day
  emptyDay: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  emptyDayIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyDayTxt:  { fontSize: 14, color: '#94A3B8', fontWeight: '600' },
  emptyAddBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  emptyAddBtnTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // Note card
  noteCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    overflow: 'hidden',
  },
  noteBar:     { width: 4 },
  noteContent: { flex: 1, padding: 14 },
  noteHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noteAvatar:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  noteAvatarTxt: { fontSize: 18, fontWeight: '800' },
  notePhoto:   { width: 40, height: 40, borderRadius: 12, flexShrink: 0 },
  noteTitle:   { fontSize: 14, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
  noteBody:    { fontSize: 13, color: '#475569', lineHeight: 18 },
  noteActions: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  noteActionBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  noteFullPhoto: { width: '100%', height: 160, borderRadius: 10, marginTop: 10 },
  noteTime:    { fontSize: 11, color: '#CBD5E1', marginTop: 8, fontWeight: '600' },

  // Month picker
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
  monthCellTxt:        { fontSize: 14, fontWeight: '600', color: '#475569' },
  monthCellTxtActive:  { color: '#fff', fontWeight: '800' },
  pickerClose:    { paddingVertical: 13, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  pickerCloseTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },

  // Add/Edit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '92%' },
  modalHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalTitle:   { fontSize: 17, fontWeight: '800', color: '#1E293B', flex: 1 },
  modalClose:   { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },

  photoArea:       { borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderStyle: 'dashed', minHeight: 120 },
  photoPreview:    { width: '100%', height: 180 },
  photoOverlay:    { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', gap: 6 },
  photoOverlayTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  photoPlaceholder:    { alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 24 },
  photoPlaceholderIcon:{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderTxt: { fontSize: 14, fontWeight: '700', color: '#94A3B8' },
  photoPlaceholderSub: { fontSize: 12, color: '#CBD5E1' },

  fieldGroup:  { marginBottom: 14 },
  fieldLabel:  { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput:  { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  bodyInput:   { height: 100, textAlignVertical: 'top' },

  modalActions:   { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  modalSaveBtn:   { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
  modalSaveTxt:   { fontSize: 15, fontWeight: '700', color: '#fff' },
})
