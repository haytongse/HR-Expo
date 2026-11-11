import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { useDispatch } from 'react-redux'
import { authService } from '../services/authService'
import { setCredentials } from '../store/authSlice'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[\d\s\-() ]{7,20}$/

function detectType(val: string): 'email' | 'phone' | 'other' {
  if (EMAIL_RE.test(val)) return 'email'
  if (PHONE_RE.test(val) && !val.includes('@')) return 'phone'
  return 'other'
}

function getIcon(val: string) {
  const t = detectType(val)
  if (t === 'email') return 'envelope'
  if (t === 'phone') return 'phone'
  return 'user'
}

export default function LoginScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const dispatch = useDispatch()

  const validateIdentifier = (value: string) => {
    if (!value.trim()) {
      setIdentifierError('Email or phone number is required')
      return false
    }
    setIdentifierError('')
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleLogin = async () => {
    const idOk = validateIdentifier(identifier)
    const pwOk = validatePassword(password)
    if (!idOk || !pwOk) return

    setLoading(true)
    try {
      const result = await authService.login(identifier.trim(), password)
      dispatch(setCredentials({ user: result.user, token: result.token }))
      navigation.replace('MainTabs')
    } catch (err: any) {
      const message: string = err.response?.data?.message ?? ''
      if (message === 'Email or phone number not found') {
        setIdentifierError('Account not found')
      } else if (message === 'Incorrect password') {
        setPasswordError('Incorrect password')
      } else if (message === 'Your account is inactive. Please contact admin.') {
        setPasswordError('Account inactive. Contact admin.')
      } else if (message) {
        setPasswordError(message)
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setPasswordError('Request timed out. Check your connection.')
      } else if (!err.response) {
        setPasswordError(`Network error: ${err.message ?? 'Cannot reach server'}`)
      } else {
        setPasswordError(`Error ${err.response.status}: ${err.response.data?.message ?? 'Login failed'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const icon = getIcon(identifier)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>HR</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Identifier Field */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Email or Phone Number</Text>
          <View style={[styles.inputBox, identifierError ? styles.inputError : null]}>
            <FontAwesome5 name={icon} iconStyle="solid" size={16} color="#94A3B8" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="email@example.com or 08x-xxx-xxxx"
              placeholderTextColor="#94A3B8"
              value={identifier}
              onChangeText={(v) => { setIdentifier(v); if (identifierError) validateIdentifier(v) }}
              onBlur={() => validateIdentifier(identifier)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {identifierError ? (
            <View style={styles.errorRow}>
              <FontAwesome5 name="exclamation-circle" iconStyle="solid" size={12} color="#EF4444" />
              <Text style={styles.errorText}>{identifierError}</Text>
            </View>
          ) : null}
        </View>

        {/* Password Field */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputBox, passwordError ? styles.inputError : null]}>
            <FontAwesome5 name="lock" iconStyle="solid" size={16} color="#94A3B8" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(v) => { setPassword(v); if (passwordError) validatePassword(v) }}
              onBlur={() => validatePassword(password)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)} style={styles.eyeBtn}>
              <FontAwesome5
                name={showPassword ? 'eye-slash' : 'eye'}
                iconStyle="solid"
                size={18}
                color="#94A3B8"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <View style={styles.errorRow}>
              <FontAwesome5 name="exclamation-circle" iconStyle="solid" size={12} color="#EF4444" />
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" size={18} />
            : <Text style={styles.btnText}>Sign In</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1E293B',
    paddingVertical: 13,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
})
