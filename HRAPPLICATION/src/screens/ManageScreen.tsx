import React from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

interface MenuItem {
  key: string
  label: string
  subtitle: string
  icon: string
  iconColor: string
  iconBg: string
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'Campuses',       label: 'Campuses',        subtitle: 'Manage campus locations',          icon: 'building',       iconColor: '#6366F1', iconBg: '#EEF2FF' },
  { key: 'Users',          label: 'Users',            subtitle: 'Manage employee accounts',        icon: 'users',         iconColor: '#10B981', iconBg: '#D1FAE5' },
  { key: 'Timetable',      label: 'Timetable',        subtitle: 'Shift schedules & timetables',    icon: 'clock',           iconColor: '#8B5CF6', iconBg: '#F3E8FF' },
  { key: 'PublicHoliday',  label: 'Public Holiday',   subtitle: 'Define public holidays',     icon: 'calendar-alt',       iconColor: '#EF4444', iconBg: '#FEE2E2' },
  { key: 'LeaveType',      label: 'Leave Type',       subtitle: 'Configure leave categories', icon: 'list',           iconColor: '#EC4899', iconBg: '#FCE7F3' },
  { key: 'LeaveRequests',  label: 'Leave Requests',   subtitle: 'Review & approve leaves',    icon: 'file-alt',  iconColor: '#0EA5E9', iconBg: '#E0F2FE' },
  { key: 'DailyWork',      label: 'Daily Work',       subtitle: 'Monitor daily activities',   icon: 'briefcase',      iconColor: '#F97316', iconBg: '#FFEDD5' },
  { key: 'CheckIns',       label: 'Check-ins',        subtitle: 'View attendance records',    icon: 'qrcode',           iconColor: '#14B8A6', iconBg: '#CCFBF1' },
  { key: 'Announcements',     label: 'Announcements',       subtitle: 'Post team announcements',       icon: 'bullhorn',  iconColor: '#6366F1', iconBg: '#EEF2FF' },
  { key: 'DocumentNumbering', label: 'Document Numbering',  subtitle: 'Auto-number employee codes',    icon: 'hashtag',   iconColor: '#0EA5E9', iconBg: '#E0F2FE' },
]

export default function ManageScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const user = useSelector((s: RootState) => s.auth.user)

  if (user?.role !== 'admin') {
    return (
      <View style={styles.denied}>
        <View style={styles.deniedIcon}>
          <FontAwesome5 iconStyle="solid" name="lock" size={40} color="#6366F1" />
        </View>
        <Text style={styles.deniedTitle}>Access Restricted</Text>
        <Text style={styles.deniedSub}>This section is for administrators only.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Management</Text>
        <Text style={styles.headerSub}>Select a section to manage</Text>
      </View>

      {/* Menu List */}
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.group}>
          {MENU_ITEMS.map((item, index) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.6}
                onPress={() => {
                  if (item.key === 'CheckIns') { navigation.navigate('CheckIns'); return }
                  if (item.key === 'Announcements') { navigation.navigate('Announcements'); return }
                  navigation.navigate('ManageDetail', { section: item.key, title: item.label })
                }}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                  <FontAwesome5 iconStyle="solid" name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.subtitle}</Text>
                </View>
                <FontAwesome5 iconStyle="solid" name="chevron-right" size={16} color="#CBD5E1" />
              </TouchableOpacity>
              {index < MENU_ITEMS.length - 1 && <View style={styles.sep} />}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },

  header: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  list: { paddingHorizontal: 16, paddingTop: 16 },
  group: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  menuSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  sep: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 70 },

  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F1F5F9' },
  deniedIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  deniedTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  deniedSub: { fontSize: 14, color: '#94A3B8' },
})
