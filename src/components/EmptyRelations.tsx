/**
 * components/EmptyRelations.tsx
 *
 * Shown on Home when the user has zero relations.
 * An invitation to act, not a dead end.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface EmptyRelationsProps {
  onFindPeople: () => void;
}

export function EmptyRelations({ onFindPeople }: EmptyRelationsProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg }]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceAlt,
            width: 88,
            height: 88,
            borderRadius: 44,
            marginBottom: spacing.lg,
          },
        ]}
      >
        <Ionicons name="people-outline" size={36} color={colors.textMuted} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: typography.size.lg,
          fontWeight: '700',
          marginBottom: spacing.xs,
          textAlign: 'center',
        }}
      >
        No connections yet
      </Text>

      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.size.sm,
          textAlign: 'center',
          marginBottom: spacing.lg,
          maxWidth: 260,
        }}
      >
        Find people you know and send them an invite to get started.
      </Text>

      <Pressable
        onPress={onFindPeople}
        style={({ pressed }) => [
          styles.cta,
          {
            backgroundColor: colors.primary,
            borderRadius: radius.lg,
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.lg,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="search" size={16} color={colors.primaryText} />
        <Text
          style={{
            color: colors.primaryText,
            fontWeight: '600',
            marginLeft: spacing.xs,
            fontSize: typography.size.sm,
          }}
        >
          Find people
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
