import React, { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Animated, Modal, TouchableOpacity,
  Platform, StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthViewModel } from '../viewmodels/useAuthViewModel'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { version } from '../../package.json'
import { navigationRef } from '../navigation/navigationRef'

const HEADER_EXPANDED = 220
const HEADER_COLLAPSED = 70

interface InfoRowProps {
  icon: string
  label: string
  value?: string | null
  iconBg: string
  iconColor: string
}
function InfoRow({ icon, label, value, iconBg, iconColor }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <FontAwesome5 iconStyle="solid" name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.infoRowText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoVal} numberOfLines={1}>{value || '—'}</Text>
      </View>
    </View>
  )
}

function ProfileContent() {
  const { user, signOut } = useAuthViewModel()
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top

  const [showConfirm, setShowConfirm] = useState(false)
  const isAdmin = user?.role === 'admin'

  const scrollY = useRef(new Animated.Value(0)).current
  const scrollRange = HEADER_EXPANDED - HEADER_COLLAPSED

  const headerHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [HEADER_EXPANDED + topInset, HEADER_COLLAPSED + topInset],
    extrapolate: 'clamp',
  })

  const avatarScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const avatarOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  const titleOpacity = scrollY.interpolate({
    inputRange: [scrollRange * 0.5, scrollRange],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  })

  const detailOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  })

  return (
    <View style={styles.container}>

      {/* ── Fixed Animated Header ── */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>

        {/* Collapsed: name centered in header (fades in when scrolled) */}
        <Animated.Text style={[styles.collapsedName, { opacity: titleOpacity, marginTop: topInset }]} numberOfLines={1}>
          {user?.fullName || 'Profile'}
        </Animated.Text>

        {/* Expanded: avatar + details pinned at bottom (fades out when scrolled) */}
        <Animated.View style={[styles.expandedContent, { opacity: detailOpacity }]}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>{user?.initials || '?'}</Text>
            </View>
            <View style={[styles.roleBadge, isAdmin ? styles.roleBadgeAdmin : styles.roleBadgeUser]}>
              <FontAwesome5 iconStyle="solid" name={isAdmin ? 'shield-alt' : 'user'} size={10} color={isAdmin ? '#6366F1' : '#10B981'} />
              <Text style={[styles.roleBadgeTxt, { color: isAdmin ? '#6366F1' : '#10B981' }]}>
                {isAdmin ? 'Admin' : 'Employee'}
              </Text>
            </View>
          </Animated.View>
          <Text style={styles.headerName}>{user?.fullName || 'User'}</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Scrollable Content ── */}
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: HEADER_EXPANDED + topInset + 12 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >

        {/* ── Info Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <InfoRow icon="envelope"     label="Email"    value={user?.email}       iconBg="#EEF2FF" iconColor="#6366F1" />
          <View style={styles.sep} />
          <InfoRow icon="phone"     label="Phone"    value={user?.phoneNumber} iconBg="#D1FAE5" iconColor="#10B981" />
          <View style={styles.sep} />
          <InfoRow icon="map-marker-alt" label="Address"  value={user?.address}     iconBg="#FEF3C7" iconColor="#F59E0B" />
          <View style={styles.sep} />
          <InfoRow icon="calendar-alt" label="Birthday" value={user?.birthOfDate} iconBg="#FEE2E2" iconColor="#EF4444" />
        </View>

        {/* ── Account Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: '#EEF2FF' }]}>
              <FontAwesome5 iconStyle="solid" name="id-card" size={18} color="#6366F1" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoVal}>{isAdmin ? 'Administrator' : 'Employee'}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: user?.status === 'active' ? '#D1FAE5' : '#F1F5F9' }]}>
              <Text style={[styles.statusChipTxt, { color: user?.status === 'active' ? '#10B981' : '#94A3B8' }]}>
                {user?.status || 'active'}
              </Text>
            </View>
          </View>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('MyLeave')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#FEF3C7' }]}>
              <FontAwesome5 iconStyle="solid" name="file-alt" size={18} color="#F59E0B" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>Leave</Text>
              <Text style={styles.infoVal}>My Requests</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('DailyWork')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#FFEDD5' }]}>
              <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>Work</Text>
              <Text style={styles.infoVal}>Daily Work</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* ── Sign Out ── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => setShowConfirm(true)} activeOpacity={0.8}>
          <View style={styles.signOutIcon}>
            <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={20} color="#EF4444" />
          </View>
          <Text style={styles.signOutTxt}>Sign Out</Text>
          <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#EF4444" />
        </TouchableOpacity>

        {/* ── Version ── */}
        <View style={styles.versionRow}>
          <FontAwesome5 iconStyle="solid" name="tag" size={11} color="#CBD5E1" />
          <Text style={styles.versionTxt}>Version {version}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ── Sign Out Confirm Modal ── */}
      <Modal visible={showConfirm} transparent animationType="fade" onRequestClose={() => setShowConfirm(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIconWrap}>
              <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={30} color="#EF4444" />
            </View>
            <Text style={styles.dialogTitle}>Sign Out</Text>
            <Text style={styles.dialogSub}>Are you sure you want to sign out of your account?</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirm(false)} activeOpacity={0.8}>
                <Text style={styles.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={async () => {
                  setShowConfirm(false)
                  await signOut()
                  navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] })
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmTxt}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default function ProfileScreen() {
  return (
    <SafeAreaProvider>
      <ProfileContent />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { paddingBottom: 20 },
  bottomSpacer: { height: 80 },

  // Animated header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  collapsedName: { fontSize: 17, fontWeight: '800', color: '#fff', position: 'absolute' },
  expandedContent: {
    position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center',
  },
  avatarWrap: { alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarTxt: { fontSize: 30, fontWeight: '800', color: '#fff' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6,
  },
  roleBadgeAdmin: { backgroundColor: '#EEF2FF' },
  roleBadgeUser:  { backgroundColor: '#D1FAE5' },
  roleBadgeTxt: { fontSize: 11, fontWeight: '700' },
  headerName:  { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  headerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 },

  // Card
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14,
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTitle: {
    fontSize: 13, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 16,
  },
  infoRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  infoRowText: { flex: 1 },
  infoIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoLabel:   { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  infoVal:     { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  sep:         { height: 1, backgroundColor: '#F8FAFC', marginVertical: 14, marginLeft: 54 },
  statusChip:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusChipTxt: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginTop: 14, backgroundColor: '#fff',
    borderRadius: 20, padding: 18, borderWidth: 1.5, borderColor: '#FEE2E2',
    shadowColor: '#EF4444', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 },
  },
  signOutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  signOutTxt:  { flex: 1, fontSize: 15, fontWeight: '700', color: '#EF4444' },

  // Version
  versionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
  versionTxt: { fontSize: 12, color: '#CBD5E1', fontWeight: '600' },

  // Modal
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  dialog:        { margin: 24, backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center' },
  dialogIconWrap:{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dialogTitle:   { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  dialogSub:     { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  dialogBtns:    { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelTxt:     { fontSize: 15, fontWeight: '700', color: '#64748B' },
  confirmBtn:    { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmTxt:    { fontSize: 15, fontWeight: '700', color: '#fff' },
})
