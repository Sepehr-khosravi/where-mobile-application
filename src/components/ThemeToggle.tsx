/**
 * components/ThemeToggle.tsx
 *
 * Drop this anywhere (e.g. a settings screen) to let the user
 * switch between System / Light / Dark.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeMode, useTheme } from '../theme/ThemeContext';

const OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function ThemeToggle() {
  const { mode, setMode, colors, spacing, radius } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.xs },
      ]}
    >
      {OPTIONS.map((option) => {
        const isActive = mode === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => setMode(option.value)}
            style={[
              styles.option,
              {
                backgroundColor: isActive ? colors.primary : 'transparent',
                borderRadius: radius.sm,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
          >
            <Text
              style={{
                color: isActive ? colors.primaryText : colors.text,
                fontWeight: isActive ? '600' : '400',
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    alignItems: 'center',
  },
});
