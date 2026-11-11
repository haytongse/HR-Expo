import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'

interface Props {
  children: React.ReactNode
  style?: ViewStyle | ViewStyle[]
  padding?: number
}

export default function AppCard({ children, style, padding = 16 }: Props) {
  return (
    <View style={[styles.card, { padding }, style as ViewStyle]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
})
