/**
 * components/GlassTabBarBackground.tsx
 *
 * Real frosted-glass blur behind the tab bar. Fills whatever shape
 * tabBarStyle defines — the rounded-pill clipping happens on the
 * outer tabBarStyle (borderRadius + overflow: 'hidden') in
 * app/(tabs)/_layout.tsx, not here. This component only owns the
 * blur + tint + inner border, so it always matches that shape exactly.
 */

import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function GlassTabBarBackground() {
  const { colors, scheme, radius } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: radius.full, overflow: 'hidden',}]}>
      <BlurView
        tint={scheme === 'dark' ? 'dark' : 'light'}
        intensity={Platform.OS === 'ios' ? 80 : 120}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBarTint }]} />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius.full,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.tabBarBorder,
          },
        ]}
      />
    </View>
  );
}