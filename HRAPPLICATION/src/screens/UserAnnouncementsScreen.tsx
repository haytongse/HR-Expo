import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  ActivityIndicator, RefreshControl, Image, useWindowDimensions,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { announcementService, type Announcement } from '../services/announcementService'

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

export default function UserAnnouncementsScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const { width: W } = useWindowDimensions()

  const [items, setItems]           = useState<Announcement[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [galleryIdx, setGalleryIdx]       = useState(0)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      await announcementService.markAllRead()
      const data = await announcementService.getAll()
      setItems(data)
    } catch {}
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const renderItem = ({ item, index }: { item: Announcement; index: number }) => {
    const uris = item.photos.map(p => announcementService.photoUrl(p.photoPath))
    const isFirst = index === 0
    const isLast  = index === items.length - 1
    return (
      <TouchableOpacity
        style={[st.listItem, isFirst && st.listItemFirst, isLast && st.listItemLast, !isLast && st.listItemDivider]}
        onPress={() => uris.length > 0 ? (setGalleryPhotos(uris), setGalleryIdx(0)) : null}
        activeOpacity={0.7}
      >
        <View style={st.rowItem}>
          {uris[0] ? (
            <View style={st.thumbWrap}>
              <Image source={{ uri: uris[0] }} style={st.thumb} resizeMode="cover" />
              {uris.length > 1 && (
                <View style={st.thumbMore}><Text style={st.thumbMoreTxt}>+{uris.length - 1}</Text></View>
              )}
            </View>
          ) : (
            <View style={st.iconBox}>
              <FontAwesome5 iconStyle="solid" name="bullhorn" size={22} color="#6366F1" />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <View style={st.titleRow}>
              {!item.isRead && <View style={st.unreadDot} />}
              <Text style={[st.itemTitle, !item.isRead && st.itemTitleUnread]} numberOfLines={2}>{item.title}</Text>
            </View>
            {item.body ? (
              <Text style={st.itemSub} numberOfLines={1}>{item.body}</Text>
            ) : null}
            <View style={st.metaRow}>
              {item.scheduledAt && (
                <View style={st.schedChip}>
                  <FontAwesome5 iconStyle="solid" name="calendar-alt" size={10} color="#6366F1" />
                  <Text style={st.schedChipTxt}>{formatSchedule(item.scheduledAt)}</Text>
                </View>
              )}
              <Text style={st.metaDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
        </View>
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
            </View>
          }
        />
      )}

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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  list: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 },

  listItem: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14 },
  listItemFirst: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  listItemLast: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  listItemDivider: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },

  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  thumbWrap: { width: 44, height: 44, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' },
  thumb: { width: 44, height: 44 },
  thumbMore: { position: 'absolute', bottom: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1 },
  thumbMoreTxt: { fontSize: 8, fontWeight: '700', color: '#fff' },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#6366F1', flexShrink: 0 },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  itemTitleUnread: { fontWeight: '700', color: '#1E293B' },
  itemSub: { fontSize: 12, color: '#64748B', marginTop: 1 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' },
  schedChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  schedChipTxt: { fontSize: 10, fontWeight: '600', color: '#6366F1' },
  metaDate: { fontSize: 11, color: '#94A3B8' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#94A3B8' },

  galleryOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  galleryClose: { position: 'absolute', top: 52, right: 20, zIndex: 10 },
  galleryNav: { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 16 },
  galleryArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  galleryCounter: { fontSize: 14, color: '#fff', fontWeight: '600' },
})
