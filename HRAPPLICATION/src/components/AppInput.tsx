import React, { useState } from 'react'
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

interface Props extends TextInputProps {
  label?: string
  error?: string
  leftIcon?: string
  isPassword?: boolean
}

export default function AppInput({ label, error, leftIcon, isPassword, ...props }: Props) {
  const [show, setShow] = useState(false)
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.container, error ? styles.errBorder : styles.border]}>
        {leftIcon && <FontAwesome5 iconStyle="solid" name={leftIcon as any} size={20} color="#94A3B8" style={styles.icon} />}
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          secureTextEntry={isPassword && !show}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow(s => !s)} style={styles.icon}>
            <FontAwesome5 iconStyle="solid" name={show ? 'eye-slash' : 'eye'} size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  container: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1.5, backgroundColor: '#fff', paddingHorizontal: 14 },
  border: { borderColor: '#E2E8F0' },
  errBorder: { borderColor: '#EF4444' },
  input: { flex: 1, fontSize: 15, color: '#1E293B', paddingVertical: 13 },
  icon: { marginRight: 8 },
  error: { fontSize: 12, color: '#EF4444', marginTop: 4 },
})
