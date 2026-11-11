import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import SplashScreen from '../screens/SplashScreen'
import LoginScreen from '../screens/LoginScreen'
import MainTabNavigator from './MainTabNavigator'
import { navigationRef } from './navigationRef'
import { notificationService } from '../services/notificationService'

const Stack = createStackNavigator()

export default function AppNavigator() {
  useEffect(() => {
    const unsub = notificationService.setupListeners()
    return unsub
  }, [])

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
