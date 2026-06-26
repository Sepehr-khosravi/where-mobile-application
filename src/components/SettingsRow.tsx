/**
 * components/SettingsRow.tsx
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
  danger = false,
}: SettingsRowProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.surfaceAlt, width: 30, height: 30, borderRadius: 8 },
        ]}
      >
        <Ionicons name={icon} size={16} color={danger ? colors.danger : colors.primary} />
      </View>

      <Text
        style={{
          flex: 1,
          color: danger ? colors.danger : colors.text,
          fontSize: typography.size.md,
          marginLeft: spacing.md,
        }}
      >
        {label}
      </Text>

      {rightElement}

      {!rightElement && value && (
        <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginRight: spacing.xs }}>
          {value}
        </Text>
      )}

      {!rightElement && showChevron && onPress && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
