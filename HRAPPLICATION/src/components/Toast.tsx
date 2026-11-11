import React, { useState, useRef, useEffect } from 'react'
import { Animated, Text, View, StyleSheet } from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  duration: number
}

type ShowFn = (message: string, type?: ToastType, duration?: number) => void
let _showFn: ShowFn | null = null

export const Toast = {
  show: (message: string, type: ToastType = 'info', duration = 3000) =>
    _showFn?.(message, type, duration),
  success: (message: string) => Toast.show(message, 'success'),
  error: (message: string) => Toast.show(message, 'error'),
  warning: (message: string) => Toast.show(message, 'warning'),
  info: (message: string) => Toast.show(message, 'info'),
}

const CONFIG: Record<ToastType, { bg: string; bar: string; icon: string; iconColor: string; text: string }> = {
  success: { bg: '#ECFDF5', bar: '#10B981', icon: 'check-circle', iconColor: '#10B981', text: '#065F46' },
  error:   { bg: '#FEF2F2', bar: '#EF4444', icon: 'times-circle',     iconColor: '#EF4444', text: '#991B1B' },
  warning: { bg: '#FFFBEB', bar: '#F59E0B', icon: 'exclamation-triangle',          iconColor: '#F59E0B', text: '#92400E' },
  info:    { bg: '#EFF6FF', bar: '#3B82F6', icon: 'info-circle',iconColor: '#3B82F6', text: '#1E40AF' },
}

function SingleToast({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const translateY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onDone())
    }, item.duration)

    return () => clearTimeout(timer)
  }, [])

  const c = CONFIG[item.type]
  return (
    <Animated.View style={[styles.toast, { backgroundColor: c.bg, transform: [{ translateY }], opacity }]}>
      <View style={[styles.bar, { backgroundColor: c.bar }]} />
      <FontAwesome5 iconStyle="solid" name={c.icon as any} size={22} color={c.iconColor} style={styles.toastIcon} />
      <Text style={[styles.msg, { color: c.text }]} numberOfLines={3}>{item.message}</Text>
    </Animated.View>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  useEffect(() => {
    _showFn = (message, type = 'info', duration = 3000) => {
      const id = ++counter.current
      setToasts(prev => [...prev.slice(-2), { id, message, type, duration }])
    }
    return () => { _showFn = null }
  }, [])

  if (toasts.length === 0) return null

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map(item => (
        <SingleToast
          key={item.id}
          item={item}
          onDone={() => setToasts(prev => prev.filter(t => t.id !== item.id))}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: 8,
  },
  bar: { width: 4, alignSelf: 'stretch' },
  toastIcon: { marginHorizontal: 12 },
  msg: { flex: 1, fontSize: 14, fontWeight: '600', paddingVertical: 14, paddingRight: 16, lineHeight: 20 },
})
