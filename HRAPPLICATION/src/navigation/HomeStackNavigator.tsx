import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../screens/HomeScreen'
import UserAnnouncementsScreen from '../screens/UserAnnouncementsScreen'

const Stack = createStackNavigator()

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="UserAnnouncements" component={UserAnnouncementsScreen} />
    </Stack.Navigator>
  )
}
