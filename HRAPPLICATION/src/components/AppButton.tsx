import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'

type Variant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'

interface Props {
  title: string
  onPress?: () => void
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  style?: ViewStyle
  fullWidth?: boolean
}

export default function AppButton({ title, onPress, variant = 'primary', loading, disabled, style, fullWidth }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], fullWidth && styles.full, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#6366F1' : '#fff'} size={18} />
        : <Text style={[styles.text, styles[`t_${variant}` as keyof typeof styles]]}>{title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: { paddingHorizontal: 20, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  full: { width: '100%' },
  disabled: { opacity: 0.6 },
  primary: { backgroundColor: '#6366F1' },
  secondary: { backgroundColor: '#10B981' },
  danger: { backgroundColor: '#EF4444' },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#6366F1' },
  ghost: { backgroundColor: 'transparent' },
  text: { fontSize: 15, fontWeight: '600' },
  t_primary: { color: '#FFFFFF' },
  t_secondary: { color: '#FFFFFF' },
  t_danger: { color: '#FFFFFF' },
  t_outline: { color: '#6366F1' },
  t_ghost: { color: '#6366F1' },
})
