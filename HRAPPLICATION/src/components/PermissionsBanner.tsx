import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { AppPermissions } from '../hooks/useAppPermissions'

interface Props {
  permissions: AppPermissions
  onRequest: () => void
  onOpenSettings: () => void
}

export default function PermissionsBanner({ permissions, onRequest, onOpenSettings }: Props) {
  const cameraOk = permissions.camera === 'granted'
  const notifOk  = permissions.notifications === 'granted'

  if (cameraOk && notifOk) return null

  const isBlocked =
    permissions.camera === 'blocked' || permissions.notifications === 'blocked'

  const missing: string[] = []
  if (!cameraOk) missing.push('Camera')
  if (!notifOk)  missing.push('Notifications')

  return (
    <View style={styles.banner}>
      <View style={styles.iconRow}>
        {!cameraOk && (
          <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
            <FontAwesome5 iconStyle="solid" name="camera" size={16} color="#EF4444" />
          </View>
        )}
        {!notifOk && (
          <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
            <FontAwesome5 iconStyle="solid" name="bell-slash" size={16} color="#F59E0B" />
          </View>
        )}
      </View>

      <View style={styles.textCol}>
        <Text style={styles.title}>
          {missing.join(' & ')} {missing.length > 1 ? 'permissions' : 'permission'} required
        </Text>
        <Text style={styles.sub}>
          {isBlocked
            ? 'Please enable in device Settings.'
            : 'Allow access for the best experience.'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={isBlocked ? onOpenSettings : onRequest}
        activeOpacity={0.8}
      >
        <FontAwesome5
          iconStyle="solid"
          name={isBlocked ? 'cog' : 'check'}
          size={12}
          color="#fff"
        />
        <Text style={styles.btnTxt}>{isBlocked ? 'Settings' : 'Allow'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  iconRow: { flexDirection: 'row', gap: 6 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  sub:   { fontSize: 11, color: '#B45309', marginTop: 1 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  btnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
})
