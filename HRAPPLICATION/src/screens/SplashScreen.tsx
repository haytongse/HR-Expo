import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { authService } from '../services/authService'

export default function SplashScreen({ navigation }: any) {
  useEffect(() => {
    const timer = setTimeout(async () => {
      const token = await authService.getToken()
      navigation.replace(token ? 'MainTabs' : 'Login')
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logoText}>HR</Text>
      </View>
      <Text style={styles.title}>HR Application</Text>
      <Text style={styles.subtitle}>Smart Check-In System</Text>
      <ActivityIndicator style={styles.loader} color="#fff" size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  loader: {
    marginTop: 48,
  },
})
