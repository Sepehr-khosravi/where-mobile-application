/**
 * app/(auth)/verify.tsx
 *
 * 6-digit code entry, auto-submits the instant all digits are filled.
 * Resend button shows a live countdown when the 5-minute server-side
 * cooldown is active — this is the "tell the user to wait 5 min"
 * requirement, surfaced proactively instead of only after they tap
 * resend and get an error.
 *
 * Test code while using the mock backend: 123456
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CodeInput } from '../../components/CodeInput';
import { useAuth } from '../../contexts/AuthContext';
import {
  AuthError,
  getResendCooldownSeconds,
  markCodeJustSent,
  resendCode,
  verifyCode,
} from '../../services/auth';
import { useTheme } from '../../theme/ThemeContext';

function formatCooldown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VerifyScreen() {
  const { colors, spacing, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { email, mode } = useLocalSearchParams<{ email: string; mode: string }>();
  const { signIn } = useAuth();

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [resending, setResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Tick the cooldown countdown every second, sourced from the
  // service's own tracking (so it stays correct even if the screen
  // re-mounts) rather than a local timer we'd have to re-derive.
  useEffect(() => {
    setCooldownSeconds(getResendCooldownSeconds(email));
    const interval = setInterval(() => {
      setCooldownSeconds(getResendCooldownSeconds(email));
    }, 1000);
    return () => clearInterval(interval);
  }, [email]);

  const handleComplete = useCallback(
    async (code: string) => {
      setError(null);
      setVerifying(true);
      try {
        const { token } = await verifyCode(email, code);
        await signIn(token);
        router.push('/(tabs)');
      } catch (err) {
        if (err instanceof AuthError) {
          setError(err.message);
        } else {
          setError('Something went wrong. Please try again.');
        }
        setResetSignal((n) => n + 1); // clears the boxes for another attempt
      } finally {
        setVerifying(false);
      }
    },
    [email, router, signIn]
  );

  const handleResend = async () => {
    setError(null);
    setResending(true);
    try {
      await resendCode(email);
      markCodeJustSent(email);
      setCooldownSeconds(getResendCooldownSeconds(email));
    } catch (err) {
      if (err instanceof AuthError && err.code === 'RESEND_COOLDOWN') {
        // This is the core "you need to wait 5 min" UX requirement —
        // surfaced as a clear, specific message, with the exact wait
        // time from the server's own cooldown tracking.
        setError(
          `You need to wait ${formatCooldown(err.retryAfterSeconds ?? 0)} before requesting another code.`
        );
        setCooldownSeconds(err.retryAfterSeconds ?? 0);
      } else if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError('Could not resend code. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  const canResend = cooldownSeconds === 0 && !resending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ paddingTop: insets.top + spacing.xxl, paddingHorizontal: spacing.xl }}>
        <Text style={{ color: colors.text, fontSize: typography.size.xxl, fontWeight: '700' }}>
          Enter your code
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: typography.size.sm,
            marginTop: spacing.xs,
            marginBottom: spacing.xl,
          }}
        >
          We sent a 6-digit code to {email}
        </Text>

        <CodeInput onComplete={handleComplete} disabled={verifying} resetSignal={resetSignal} />

        <View style={{ marginTop: spacing.lg, minHeight: 40, justifyContent: 'center' }}>
          {verifying ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginLeft: spacing.sm }}>
                Verifying…
              </Text>
            </View>
          ) : !!error ? (
            <Text style={{ color: colors.danger, fontSize: typography.size.sm }}>{error}</Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.md }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            Didn't get a code?{' '}
          </Text>
          <Pressable onPress={handleResend} disabled={!canResend} hitSlop={8}>
            <Text
              style={{
                color: canResend ? colors.primary : colors.textMuted,
                fontSize: typography.size.sm,
                fontWeight: '700',
              }}
            >
              {resending
                ? 'Sending…'
                : canResend
                ? 'Resend code'
                : `Resend in ${formatCooldown(cooldownSeconds)}`}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});