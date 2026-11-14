import React, { useRef, useState } from 'react'
import {
  View, Text, StyleSheet, Animated, Modal, TouchableOpacity,
  Platform, StatusBar, Image, TextInput, ScrollView, ActivityIndicator,
  ActionSheetIOS, Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux'
import { useAuthViewModel } from '../viewmodels/useAuthViewModel'
import { updateUser } from '../store/authSlice'
import { authService } from '../services/authService'
import { SERVER_URL } from '../services/api'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { version } from '../../package.json'
import { navigationRef } from '../navigation/navigationRef'
import DateTimePicker from '@react-native-community/datetimepicker'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { useLanguage } from '../i18n/LanguageContext'

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
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top

  const [showSignOut, setShowSignOut] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPic, setUploadingPic] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editBirthday, setEditBirthday] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

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

  const openEdit = () => {
    setEditName(user?.fullName ?? '')
    setEditPhone(user?.phoneNumber ?? '')
    setEditAddress(user?.address ?? '')
    if (user?.birthOfDate) {
      const d = new Date(user.birthOfDate)
      setEditBirthday(isNaN(d.getTime()) ? null : d)
    } else {
      setEditBirthday(null)
    }
    setShowEdit(true)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const result = await authService.updateProfile({
        full_name: editName.trim() || undefined,
        phone_number: editPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        birth_of_date: editBirthday ? editBirthday.toISOString().split('T')[0] : undefined,
      })
      dispatch(updateUser({
        fullName: result.fullName,
        phoneNumber: result.phoneNumber,
        address: result.address,
        birthOfDate: result.birthOfDate,
      }))
      setShowEdit(false)
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const pickProfilePicture = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('btn_cancel'), t('profile_camera'), t('profile_gallery')], cancelButtonIndex: 0 },
        (idx) => {
          if (idx === 1) launchCam()
          if (idx === 2) launchLib()
        }
      )
    } else {
      Alert.alert(t('profile_change_photo'), '', [
        { text: t('profile_camera'), onPress: launchCam },
        { text: t('profile_gallery'), onPress: launchLib },
        { text: t('btn_cancel'), style: 'cancel' },
      ])
    }
  }

  const launchCam = () => {
    launchCamera({ mediaType: 'photo', quality: 0.7, includeBase64: true }, handlePickResult)
  }
  const launchLib = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7, includeBase64: true }, handlePickResult)
  }

  const handlePickResult = async (res: any) => {
    const asset = res?.assets?.[0]
    if (!asset?.base64) return
    setUploadingPic(true)
    try {
      const path = await authService.updateProfilePicture(`data:image/jpeg;base64,${asset.base64}`)
      dispatch(updateUser({ profilePicture: path }))
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploadingPic(false)
    }
  }

  const birthdayLabel = editBirthday
    ? editBirthday.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : t('profile_not_set')

  return (
    <View style={styles.container}>

      {/* Fixed Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>

        <Animated.Text style={[styles.collapsedName, { opacity: titleOpacity, marginTop: topInset }]} numberOfLines={1}>
          {user?.fullName || 'Profile'}
        </Animated.Text>

        <Animated.View style={[styles.expandedContent, { opacity: detailOpacity }]}>
          <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarScale }] }]}>
            <TouchableOpacity onPress={pickProfilePicture} activeOpacity={0.85}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: `${SERVER_URL}${user.profilePicture}` }}
                  style={styles.avatarImg}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarTxt}>{user?.initials || '?'}</Text>
                </View>
              )}
              <View style={styles.cameraBtn}>
                {uploadingPic
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <FontAwesome5 iconStyle="solid" name="camera" size={11} color="#fff" />
                }
              </View>
            </TouchableOpacity>
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

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={[styles.content, { paddingTop: HEADER_EXPANDED + topInset + 12 }]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >

        {/* Personal Information */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{t('profile_personal_info')}</Text>
            <TouchableOpacity style={styles.editBtn} onPress={openEdit} activeOpacity={0.7}>
              <FontAwesome5 iconStyle="solid" name="edit" size={12} color="#6366F1" />
              <Text style={styles.editBtnTxt}>{t('profile_edit')}</Text>
            </TouchableOpacity>
          </View>
          <InfoRow icon="envelope"       label="Email"                    value={user?.email}       iconBg="#EEF2FF" iconColor="#6366F1" />
          <View style={styles.sep} />
          <InfoRow icon="phone"          label={t('profile_phone')}       value={user?.phoneNumber} iconBg="#D1FAE5" iconColor="#10B981" />
          <View style={styles.sep} />
          <InfoRow icon="map-marker-alt" label={t('profile_address')}     value={user?.address}     iconBg="#FEF3C7" iconColor="#F59E0B" />
          <View style={styles.sep} />
          <InfoRow icon="calendar-alt"   label={t('profile_birthday')}    value={user?.birthOfDate} iconBg="#FEE2E2" iconColor="#EF4444" />
        </View>

        {/* Account */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('profile_account')}</Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: '#EEF2FF' }]}>
              <FontAwesome5 iconStyle="solid" name="id-card" size={18} color="#6366F1" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>{t('profile_role')}</Text>
              <Text style={styles.infoVal}>{isAdmin ? 'Administrator' : 'Employee'}</Text>
            </View>
            <View style={[styles.statusChip, { backgroundColor: user?.status === 'active' ? '#D1FAE5' : '#F1F5F9' }]}>
              <Text style={[styles.statusChipTxt, { color: user?.status === 'active' ? '#10B981' : '#94A3B8' }]}>
                {user?.status || 'active'}
              </Text>
            </View>
          </View>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('MyCheckIns')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#EEF2FF' }]}>
              <FontAwesome5 iconStyle="solid" name="clock" size={18} color="#6366F1" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>{t('profile_my_checkins')}</Text>
              <Text style={styles.infoVal}>{t('profile_my_checkins')}</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('MyNotes')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#FEF3C7' }]}>
              <FontAwesome5 iconStyle="solid" name="sticky-note" size={18} color="#F59E0B" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>{t('profile_my_notes')}</Text>
              <Text style={styles.infoVal}>{t('profile_my_notes')}</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('MyLeave')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#FEF3C7' }]}>
              <FontAwesome5 iconStyle="solid" name="file-alt" size={18} color="#F59E0B" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>{t('profile_leave')}</Text>
              <Text style={styles.infoVal}>{t('profile_leave')}</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>

          <View style={styles.sep} />

          <TouchableOpacity style={styles.infoRow} onPress={() => navigation.navigate('DailyWork')} activeOpacity={0.7}>
            <View style={[styles.infoIcon, { backgroundColor: '#FFEDD5' }]}>
              <FontAwesome5 iconStyle="solid" name="briefcase" size={18} color="#F97316" />
            </View>
            <View style={styles.infoRowText}>
              <Text style={styles.infoLabel}>{t('profile_daily_work')}</Text>
              <Text style={styles.infoVal}>{t('profile_daily_work')}</Text>
            </View>
            <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={() => setShowSignOut(true)} activeOpacity={0.8}>
          <View style={styles.signOutIcon}>
            <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={20} color="#EF4444" />
          </View>
          <Text style={styles.signOutTxt}>{t('profile_logout')}</Text>
          <FontAwesome5 iconStyle="solid" name="chevron-right" size={18} color="#EF4444" />
        </TouchableOpacity>

        {/* Version */}
        <View style={styles.versionRow}>
          <FontAwesome5 iconStyle="solid" name="tag" size={11} color="#CBD5E1" />
          <Text style={styles.versionTxt}>Version {version}</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Sign Out Modal */}
      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.dialogIconWrap}>
              <FontAwesome5 iconStyle="solid" name="sign-out-alt" size={30} color="#EF4444" />
            </View>
            <Text style={styles.dialogTitle}>{t('profile_logout')}</Text>
            <Text style={styles.dialogSub}>Are you sure you want to sign out of your account?</Text>
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSignOut(false)} activeOpacity={0.8}>
                <Text style={styles.cancelTxt}>{t('btn_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={async () => {
                  setShowSignOut(false)
                  await signOut()
                  navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] })
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmTxt}>{t('profile_logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={showEdit} transparent animationType="slide" onRequestClose={() => setShowEdit(false)}>
        <View style={styles.overlay}>
          <View style={styles.editDialog}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>{t('profile_edit_title')}</Text>
              <TouchableOpacity onPress={() => setShowEdit(false)} style={styles.editClose}>
                <FontAwesome5 iconStyle="solid" name="times" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('profile_name')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder={t('profile_name')}
                  placeholderTextColor="#CBD5E1"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('profile_phone')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="e.g. +855 12 345 678"
                  placeholderTextColor="#CBD5E1"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('profile_address')}</Text>
                <TextInput
                  style={[styles.fieldInput, { height: 72, textAlignVertical: 'top' }]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder={t('profile_address')}
                  placeholderTextColor="#CBD5E1"
                  multiline
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('profile_birthday')}</Text>
                <TouchableOpacity
                  style={[styles.fieldInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: editBirthday ? '#1E293B' : '#CBD5E1', fontSize: 15 }}>{birthdayLabel}</Text>
                  <FontAwesome5 iconStyle="solid" name="calendar-alt" size={16} color="#94A3B8" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={editBirthday ?? new Date(1990, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date()}
                    onValueChange={(_e: any, d?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios')
                      if (d) setEditBirthday(d)
                    }}
                  />
                )}
                {showDatePicker && Platform.OS === 'ios' && (
                  <TouchableOpacity style={styles.doneBtn} onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.doneBtnTxt}>{t('notes_save')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.editCancelBtn} onPress={() => setShowEdit(false)} activeOpacity={0.8}>
                <Text style={styles.editCancelTxt}>{t('profile_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editSaveBtn} onPress={saveProfile} activeOpacity={0.8} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.editSaveTxt}>{t('profile_save')}</Text>
                }
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
  avatarImg: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#6366F1', borderWidth: 2, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
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
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 },
  editBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#EEF2FF', borderRadius: 10 },
  editBtnTxt: { fontSize: 12, fontWeight: '700', color: '#6366F1' },
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

  // Modal overlay
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center' },

  // Sign out dialog
  dialog:        { margin: 24, backgroundColor: '#fff', borderRadius: 24, padding: 28, alignItems: 'center' },
  dialogIconWrap:{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  dialogTitle:   { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  dialogSub:     { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  dialogBtns:    { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelTxt:     { fontSize: 15, fontWeight: '700', color: '#64748B' },
  confirmBtn:    { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF4444', alignItems: 'center' },
  confirmTxt:    { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Edit dialog
  editDialog: {
    marginHorizontal: 16, marginVertical: 60, backgroundColor: '#fff',
    borderRadius: 24, padding: 24,
  },
  editHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  editTitle:     { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  editClose:     { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  fieldGroup:    { marginBottom: 16 },
  fieldLabel:    { fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput:    { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  doneBtn:       { marginTop: 8, alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#6366F1', borderRadius: 10 },
  doneBtnTxt:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  editActions:   { flexDirection: 'row', gap: 10, marginTop: 20 },
  editCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  editCancelTxt: { fontSize: 15, fontWeight: '700', color: '#64748B' },
  editSaveBtn:   { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#6366F1', alignItems: 'center' },
  editSaveTxt:   { fontSize: 15, fontWeight: '700', color: '#fff' },
})
