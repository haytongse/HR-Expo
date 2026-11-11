import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import NetInfo, { NetInfoStateType } from '@react-native-community/netinfo'
import { useAuthViewModel } from '../../../viewmodels/useAuthViewModel'
import AppButton from '../../components/AppButton'
import AppInput from '../../components/AppInput'
import { Toast } from '../../../components/Toast'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

export default function LoginScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [wifiSsid, setWifiSsid] = useState<string | null>(null)
  const { login, isLoading, error } = useAuthViewModel()

  useEffect(() => {
    NetInfo.configure({ shouldFetchWiFiSSID: true })
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.type === NetInfoStateType.wifi) {
        const ssid = (state.details as any)?.ssid ?? null
        setWifiSsid(typeof ssid === 'string' && !ssid.includes('<unknown') ? ssid : null)
      } else {
        setWifiSsid(null)
      }
    })
    NetInfo.refresh().then(state => {
      if (state.type === NetInfoStateType.wifi) {
        const ssid = (state.details as any)?.ssid ?? null
        setWifiSsid(typeof ssid === 'string' && !ssid.includes('<unknown') ? ssid : null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogin = async () => {
    if (!identifier || !password) { Toast.error('Please fill in all fields'); return }
    try {
      const result = await login(identifier, password)
      navigation.replace(result.user.role === 'admin' ? 'AdminTabs' : 'UserTabs')
    } catch {}
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}><Text style={styles.logoText}>HR</Text></View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>
        </View>

        <View style={styles.wifiRow}>
          <FontAwesome5 iconStyle="solid"
            name={wifiSsid ? 'wifi' : 'wifi'}
            size={14}
            color={wifiSsid ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.wifiTxt, !wifiSsid && styles.wifiTxtOff]}>
            {wifiSsid ?? 'Not connected to WiFi'}
          </Text>
        </View>

        <AppInput label="Email or Phone" placeholder="your@email.com or 08x-xxx-xxxx" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" leftIcon="user" />
        <AppInput label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} isPassword leftIcon="lock" />
        {error && <Text style={styles.err}>{error}</Text>}
        <AppButton title="Sign In" onPress={handleLogin} loading={isLoading} fullWidth style={styles.btn} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoBox: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
  sub: { fontSize: 14, color: '#64748B', marginTop: 4 },
  wifiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 20, paddingVertical: 6, paddingHorizontal: 14, backgroundColor: '#F1F5F9', borderRadius: 20, alignSelf: 'center' },
  wifiTxt: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  wifiTxtOff: { color: '#94A3B8' },
  err: { color: '#EF4444', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { marginTop: 8 },
})
