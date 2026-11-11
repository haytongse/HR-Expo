import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootState } from '../../../store'
import * as Location from 'expo-location'

async function requestStartupPermissions() {
  await Location.requestForegroundPermissionsAsync()
}

export default function SplashScreen({ navigation }: any) {
  const { isLoggedIn, user } = useSelector((s: RootState) => s.auth)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    requestStartupPermissions()
    const t = setTimeout(async () => {
      const token = await AsyncStorage.getItem('access_token')
      if (token && isLoggedIn && user) {
        navigation.replace(user.role === 'admin' ? 'AdminTabs' : 'UserTabs')
      } else {
        navigation.replace('Login')
      }
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.logo}>HR</Text>
      </View>
      <Text style={styles.title}>HR Attendance</Text>
      <Text style={styles.sub}>Smart Check-In System</Text>
      <ActivityIndicator style={styles.loader} color="#fff" size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  box: { width: 88, height: 88, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  logo: { fontSize: 36, fontWeight: '800', color: '#fff' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  loader: { marginTop: 48 },
})
