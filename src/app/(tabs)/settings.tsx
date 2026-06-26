/**
 * app/(tabs)/settings.tsx
 *
 * Settings: appearance (theme mode) lives here as one option
 * among others, using the existing useTheme() system.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsRow } from '../../components/SettingsRow';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ThemeMode, useTheme } from '../../theme/ThemeContext';

function SectionLabel({ children }: { children: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: typography.size.xs,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginLeft: spacing.lg,
        marginBottom: spacing.xs,
        marginTop: spacing.lg,
      }}
    >
      {children}
    </Text>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        marginHorizontal: spacing.lg,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function Divider() {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: colors.border,
        marginLeft: spacing.lg + 30 + spacing.md, 
      }}
    />
  );
}

export default function SettingsScreen() {
  const { colors, spacing, typography, mode, setMode } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const appearanceValue: Record<ThemeMode, string> = {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={{
          color: colors.text,
          fontSize: typography.size.xl,
          fontWeight: '700',
          marginLeft: spacing.lg,
          marginTop: insets.top + spacing.xs,
          marginBottom: spacing.sm,
        }}
      >
        Settings
      </Text>

      <SectionLabel>Appearance</SectionLabel>
      <SectionCard>
        <View style={{ padding: spacing.md }}>
          <Text style={{ color: colors.text, fontSize: typography.size.sm, marginBottom: spacing.sm }}>
            Theme — currently {appearanceValue[mode]}
          </Text>
          <ThemeToggle />
        </View>
      </SectionCard>

      <SectionLabel>Account</SectionLabel>
      <SectionCard>
        <SettingsRow icon="lock-closed-outline" label="Privacy" onPress={() => {}} />
      </SectionCard>

      <SectionLabel>Support</SectionLabel>
      <SectionCard>
        <SettingsRow icon="help-circle-outline" label="Help center" onPress={() => {}} />
        <Divider />
        <SettingsRow icon="information-circle-outline" label="About" value="v0.1.0" showChevron={false} />
      </SectionCard>

      <SectionLabel>{''}</SectionLabel>
      <SectionCard>
        <SettingsRow icon="log-out-outline" label="Log out" onPress={async () => {
          await AsyncStorage.clear();
        }} danger />
      </SectionCard>

      <View style={{ height: tabBarHeight + spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});