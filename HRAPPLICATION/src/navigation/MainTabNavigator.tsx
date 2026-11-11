import React from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native'
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs'
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { useSelector } from 'react-redux'
import HomeStackNavigator from './HomeStackNavigator'
import ScanScreen from '../screens/ScanScreen'
import ProfileStackNavigator from './ProfileStackNavigator'
import ManageStackNavigator from './ManageStackNavigator'
import { RootState } from '../store'

const Tab = createBottomTabNavigator()

// ── Tab config ─────────────────��───────────────────────────��──────────────────
const TABS = [
  { name: 'Home',    icon: 'home',   label: 'Home' },
  { name: 'Scan',    icon: 'qrcode', label: 'Scan' },   // ← center floating
  { name: 'Profile', icon: 'user',   label: 'Profile' },
  { name: 'Manage',  icon: 'cog',    label: 'Manage'},
]

const TAB_BAR_HEIGHT  = 80
const SCAN_SIZE       = 80
const SCAN_RISE       = 28   // how many px the button rises above the tab bar top
const BOTTOM_OFFSET   = 0    // flush to screen bottom

// ── Custom Tab Bar ──────────────────────────────────────────────────────────
function CurvedTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">

      {/* ── Background card with curve notch ─────────────────────────────── */}
      <View style={styles.barCard}>
        {/* Left half (Home, Profile) */}
        <View style={styles.half} />
        {/* Notch spacer — leaves room for the floating scan button */}
        <View style={styles.notchSpacer} />
        {/* Right half (Manage) */}
        <View style={styles.half} />
      </View>

      {/* ── Tab items ─────────────��───────────────────��───────────────────── */}
      <View style={styles.tabRow} pointerEvents="box-none">
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
                  style={[styles.scanBtn, isFocused && styles.scanBtnActive]}
                  activeOpacity={0.85}
                >
                  <FontAwesome5
                    name="qrcode"
                    iconStyle="solid"
                    size={32}
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

// ── Styles ─────────────────────────────────��───────────────────────────────��──
const styles = StyleSheet.create({
  // Outer wrapper — sits at bottom of screen, full width
  wrapper: {
    position: 'absolute',
    bottom: BOTTOM_OFFSET,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + SCAN_RISE,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  // White bar — full width, flat top border only
  barCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 0,
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

  // Left / right halves of the bar card
  half: { flex: 1 },

  // Center notch spacer — the empty area where scan button floats
  notchSpacer: {
    width: SCAN_SIZE + 16,
    alignSelf: 'flex-end',
    height: TAB_BAR_HEIGHT,
    backgroundColor: 'transparent',
  },

  // Row of all tab items (overlaid on top of barCard)
  tabRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingHorizontal: 4,
  },

  // Regular tab item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 2,
    gap: 3,
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: '#EEF2FF',
    width: 48,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  labelActive: {
    color: '#6366F1',
  },

  // Scan slot — takes space of 1 tab + some extra for the floating button
  scanSlot: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },

  // Floating circular Scan button
  scanBtn: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT - 66,   // rises above the bar
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: SCAN_SIZE / 2,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    // White ring creates the "notch" illusion against the bar
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
