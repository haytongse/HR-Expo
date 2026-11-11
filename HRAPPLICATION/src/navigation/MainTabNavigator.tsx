import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native'
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { useSelector } from 'react-redux'
import HomeStackNavigator from './HomeStackNavigator'
import ScanScreen from '../screens/ScanScreen'
import ProfileStackNavigator from './ProfileStackNavigator'
import ManageStackNavigator from './ManageStackNavigator'
import { RootState } from '../store'

const Tab = createBottomTabNavigator()

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { name: 'Home',    icon: 'home',   label: 'Home' },
  { name: 'Scan',    icon: 'qrcode', label: 'Scan' },
  { name: 'Profile', icon: 'user',   label: 'Profile' },
  { name: 'Manage',  icon: 'cog',    label: 'Manage'},
]

const TAB_CONTENT_HEIGHT = Platform.OS === 'ios' ? 54 : 60
const SCAN_SIZE          = Platform.OS === 'ios' ? 64 : 72
const SCAN_RISE          = Platform.OS === 'ios' ? 20 : 24

// ── Custom Tab Bar ──────────────────────────────────────────────────────────
function CurvedTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const bottomPad = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 8 : 0)
  const TAB_BAR_HEIGHT = TAB_CONTENT_HEIGHT + bottomPad
  const scanIconSize = Platform.OS === 'ios' ? 26 : 30

  return (
    <View style={[styles.wrapper, { height: TAB_BAR_HEIGHT + SCAN_RISE }]} pointerEvents="box-none">

      {/* Background bar */}
      <View style={[styles.barCard, { height: TAB_BAR_HEIGHT }]}>
        <View style={styles.half} />
        <View style={[styles.notchSpacer, { width: SCAN_SIZE + 16, height: TAB_BAR_HEIGHT }]} />
        <View style={styles.half} />
      </View>

      {/* Tab items */}
      <View style={[styles.tabRow, { height: TAB_BAR_HEIGHT, paddingBottom: bottomPad > 0 ? bottomPad - 10 : 4 }]} pointerEvents="box-none">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
          const tabCfg    = TABS.find(t => t.name === route.name)!
          const isScan    = route.name === 'Scan'

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key })
          }

          if (isScan) {
            return (
              <View key={route.key} style={styles.scanSlot} pointerEvents="box-none">
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={[
                    styles.scanBtn,
                    isFocused && styles.scanBtnActive,
                    { marginBottom: SCAN_RISE },
                  ]}
                  activeOpacity={0.85}
                >
                  <FontAwesome5
                    name="qrcode"
                    iconStyle="solid"
                    size={scanIconSize}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            )
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
                <FontAwesome5
                  name={tabCfg.icon as any}
                  iconStyle="solid"
                  size={isFocused ? 18 : 16}
                  color={isFocused ? '#6366F1' : '#94A3B8'}
                />
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {tabCfg.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

// ── Navigator ─────────────────────────────────────────────────────────────────
export default function MainTabNavigator() {
  const { user } = useSelector((s: RootState) => s.auth)
  const isAdmin = user?.role === 'admin'

  return (
    <Tab.Navigator
      tabBar={props => <CurvedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"    component={HomeStackNavigator} />
      <Tab.Screen name="Scan"    component={ScanScreen} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
      {isAdmin && <Tab.Screen name="Manage" component={ManageStackNavigator} />}
    </Tab.Navigator>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  barCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
    overflow: 'visible',
  },

  half: { flex: 1 },

  notchSpacer: {
    alignSelf: 'flex-end',
    backgroundColor: 'transparent',
  },

  tabRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },

  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
    gap: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  iconWrapActive: {
    backgroundColor: '#EEF2FF',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  labelActive: {
    color: '#6366F1',
  },

  scanSlot: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  scanBtn: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: SCAN_SIZE / 2,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#6366F1',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  scanBtnActive: {
    backgroundColor: '#4F46E5',
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  scanLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  scanLabelActive: {
    color: '#6366F1',
  },
})
