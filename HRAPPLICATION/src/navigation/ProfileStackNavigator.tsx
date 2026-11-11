import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import ProfileScreen from '../screens/ProfileScreen'
import MyLeaveScreen from '../screens/MyLeaveScreen'
import DailyWorkScreen from '../screens/DailyWorkScreen'
const Stack = createStackNavigator()

export default function ProfileStackNavigator() {
  return (
    <SafeAreaProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMenu" component={ProfileScreen} />
        <Stack.Screen name="MyLeave" component={MyLeaveScreen} />
        <Stack.Screen name="DailyWork" component={DailyWorkScreen} />
      </Stack.Navigator>
    </SafeAreaProvider>
  )
}
