import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import ManageScreen from '../screens/ManageScreen'
import ManageDetailScreen from '../screens/ManageDetailScreen'
import CheckInsScreen from '../screens/CheckInsScreen'
import AnnouncementsScreen from '../screens/AnnouncementsScreen'

const Stack = createStackNavigator()

export default function ManageStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageMenu" component={ManageScreen} />
      <Stack.Screen name="ManageDetail" component={ManageDetailScreen} />
      <Stack.Screen name="CheckIns" component={CheckInsScreen} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} />
    </Stack.Navigator>
  )
}
