/**
 * app/(auth)/login.tsx
 *
 * Email only (passwordless). On success, routes to /verify with
 * mode='login'.
 */

import { AuthInput } from '@/components/AuthInput';
import { AuthError, login } from '@/services/auth';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

export default function LoginScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setPendingEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setEmailError(null);
    setGeneralError(null);

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim());
      setPendingEmail(email.trim());
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim(), mode: 'login' } });
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'INVALID_EMAIL' || err.code === 'USER_NOT_FOUND') setEmailError(err.message);
        else setGeneralError(err.message);
      } else {
        setGeneralError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.xl,
          paddingTop: insets.top + spacing.xxl,
          paddingBottom: spacing.xl,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.text, fontSize: typography.size.xxl, fontWeight: '700' }}>
          Welcome back
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Enter your email and we'll send you a code.
        </Text>

        <AuthInput
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          error={emailError}
        />

        {!!generalError && (
          <Text style={{ color: colors.danger, fontSize: typography.size.sm, marginBottom: spacing.sm }}>
            {generalError}
          </Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.lg,
              paddingVertical: spacing.md,
              opacity: pressed || submitting ? 0.8 : 1,
              marginTop: spacing.sm,
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={{ color: colors.primaryText, fontSize: typography.size.md, fontWeight: '700' }}>
              Send code
            </Text>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            New here?{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: '700' }}>
                Create an account
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
});
