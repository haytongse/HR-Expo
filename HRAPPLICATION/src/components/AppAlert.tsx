import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'

export interface AlertButton {
  text: string
  style?: 'cancel' | 'destructive' | 'default'
  onPress?: () => void
}

interface AlertConfig {
  title: string
  message?: string
  icon?: string
  iconColor?: string
  iconBg?: string
  buttons: AlertButton[]
}

interface AppAlertProps extends AlertConfig {
  visible: boolean
  onDismiss: () => void
  useModal?: boolean
}

export function AppAlert({
  visible, title, message, icon, iconColor, iconBg,
  buttons, onDismiss, useModal = true,
}: AppAlertProps) {
  if (!visible) return null

  const content = (
    <View style={st.overlay}>
      <View style={st.card}>
        {icon && (
          <View style={[st.iconWrap, { backgroundColor: iconBg ?? '#EEF2FF' }]}>
            <FontAwesome5 iconStyle="solid" name={icon} size={32} color={iconColor ?? '#6366F1'} />
          </View>
        )}
        <Text style={st.title}>{title}</Text>
        {message ? <Text style={st.message}>{message}</Text> : null}
        <View style={st.btnCol}>
          {buttons.map((btn, i) => {
            const isCancel = btn.style === 'cancel'
            const isDestructive = btn.style === 'destructive'
            return (
              <TouchableOpacity
                key={i}
                style={[
                  st.btn,
                  isCancel && st.btnCancel,
                  isDestructive && st.btnDestructive,
                  !isCancel && !isDestructive && st.btnDefault,
                ]}
                activeOpacity={0.75}
                onPress={() => { btn.onPress?.(); onDismiss() }}
              >
                <Text style={[
                  st.btnTxt,
                  isCancel && st.btnTxtCancel,
                  isDestructive && st.btnTxtDestructive,
                  !isCancel && !isDestructive && st.btnTxtDefault,
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )

  if (useModal === false) {
    return (
      <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>
        {content}
      </View>
    )
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      {content}
    </Modal>
  )
}

export function useAlert() {
  const [cfg, setCfg] = useState<AlertConfig | null>(null)

  const showAlert = (config: AlertConfig) => setCfg(config)
  const dismiss = () => setCfg(null)

  const alertProps: AppAlertProps = {
    visible: !!cfg,
    title: cfg?.title ?? '',
    message: cfg?.message,
    icon: cfg?.icon,
    iconColor: cfg?.iconColor,
    iconBg: cfg?.iconBg,
    buttons: cfg?.buttons ?? [],
    onDismiss: dismiss,
  }

  return { showAlert, alertProps }
}

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: '#010000',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  btnCol: {
    width: '100%',
    gap: 10,
    marginTop: 24,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnDestructive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  btnDefault: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnTxt: { fontSize: 15, fontWeight: '700' },
  btnTxtCancel: { color: '#64748B' },
  btnTxtDestructive: { color: '#EF4444' },
  btnTxtDefault: { color: '#f0e9e9' },
})
