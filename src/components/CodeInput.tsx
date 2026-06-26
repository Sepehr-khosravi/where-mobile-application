/**
 * components/CodeInput.tsx
 *
 * 6 individual boxes that behave like one input. Auto-advances focus
 * as you type, supports backspace-to-previous-box, and calls
 * onComplete the instant all 6 digits are filled (auto-submit, per
 * your answer — no separate "Verify" button needed).
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const CODE_LENGTH = 6;

interface CodeInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  // Bump this to force-clear the boxes (e.g. after a wrong code)
  resetSignal?: number;
}

export function CodeInput({ onComplete, disabled, resetSignal }: CodeInputProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    setDigits(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }, [resetSignal]);

  const handleChange = (text: string, index: number) => {
    // Handles both normal typing AND pasting a full code into one box
    const sanitized = text.replace(/[^0-9]/g, '');
    if (!sanitized) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      return;
    }

    if (sanitized.length > 1) {
      // Pasted multi-digit content — spread across boxes from here
      const next = [...digits];
      for (let i = 0; i < sanitized.length && index + i < CODE_LENGTH; i++) {
        next[index + i] = sanitized[i];
      }
      setDigits(next);
      const lastFilledIndex = Math.min(index + sanitized.length, CODE_LENGTH) - 1;
      inputRefs.current[Math.min(lastFilledIndex + 1, CODE_LENGTH - 1)]?.focus();
      if (next.every((d) => d !== '')) {
        onComplete(next.join(''));
      }
      return;
    }

    const next = [...digits];
    next[index] = sanitized;
    setDigits(next);

    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== '')) {
      onComplete(next.join(''));
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? CODE_LENGTH : 1} // box 0 also accepts a full pasted code
          editable={!disabled}
          autoFocus={index === 0}
          style={[
            styles.box,
            {
              borderColor: digit ? colors.primary : colors.border,
              borderRadius: radius.md,
              color: colors.text,
              fontSize: typography.size.xl,
              backgroundColor: colors.surface,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  box: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    textAlign: 'center',
    fontWeight: '700',
  },
});
