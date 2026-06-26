/**
 * components/AuthInput.tsx
 */

import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string | null;
}

export function AuthInput({ label, error, style, ...rest }: AuthInputProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: typography.size.sm,
          fontWeight: '600',
          marginBottom: spacing.xs,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: error ? colors.danger : colors.border,
            borderRadius: radius.md,
            color: colors.text,
            fontSize: typography.size.md,
            backgroundColor: colors.surface,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
        {...rest}
      />
      {!!error && (
        <Text style={{ color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderWidth: 1.5,
  },
});
