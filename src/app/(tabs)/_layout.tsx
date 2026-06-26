/**
 * app/(tabs)/_layout.tsx
 *
 * Bottom tab bar shown on every screen EXCEPT the search modal.
 * Floating glass pill — rounded on all sides, lifted off the bottom
 * edge, like the newer Telegram tab bar. Content scrolls underneath it.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassTabBarBackground } from '../../components/GlassTabBarBackground';
import { useTheme } from '../../theme/ThemeContext';

const BAR_HEIGHT = 70;
const SIDE_MARGIN = 20;

export default function TabsLayout() {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();

  // Distance from the actual bottom edge of the screen to the bottom
  // of the floating pill — respects the home indicator / gesture bar
  // on both platforms instead of a guessed fixed number.
  const bottomOffset = insets.bottom + 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          left: SIDE_MARGIN,
          right: SIDE_MARGIN,
          bottom: bottomOffset,
          height: BAR_HEIGHT,
          borderRadius: radius.full,
          borderWidth : 1,
          elevation: 0,
          marginLeft : 10,
          marginRight : 10,
          // Soft shadow so the floating pill reads as raised above
          // the content scrolling underneath it, not just pasted on.
          shadowColor: '#000',
          shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0.2,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        animation : "shift",
        tabBarBackground: () => <GlassTabBarBackground />,
        tabBarLabelStyle: {
          fontSize: typography.size.xs - 1,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}