/**
 * components/SearchBarTrigger.tsx
 *
 * Looks like a search input but is actually a button —
 * tapping it pushes the search modal. Keeps the real text input
 * on the search screen itself, avoiding state ping-pong.
 */

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface SearchBarTriggerProps {
  onPress: () => void;
}

export function SearchBarTrigger({ onPress }: SearchBarTriggerProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfaceAlt,
          borderRadius: radius.lg,
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.md,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <Text style={[styles.placeholder, { color: colors.textMuted, marginLeft: spacing.sm }]}>
        Search people to add
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 15,
  },
});
