import React, { useEffect, useState } from 'react'
import { LogBox, View, Text, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import NetInfo from '@react-native-community/netinfo'
import { store, persistor } from './src/store'
import AppNavigator from './src/navigation/AppNavigator'
import { ToastContainer } from './src/components/Toast'

LogBox.ignoreLogs(['InteractionManager has been deprecated'])

function NetworkBanner() {
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true)
    })
    return () => unsub()
  }, [])

  if (isConnected) return null

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>⚠ No Internet Connection</Text>
    </View>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <AppNavigator />
            <NetworkBanner />
            <ToastContainer />
          </View>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
})
