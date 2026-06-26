/**
 * app/(auth)/register.tsx
 *
 * Username + email only (no password — passwordless flow). On
 * success, routes to /verify with the email + 'register' context,
 * so the verify screen knows which flow it's completing.
 */

import { AuthError, register } from '@/services/auth';
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
import { AuthInput } from '../../components/AuthInput';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../theme/ThemeContext';

export default function RegisterScreen() {
  const { colors, spacing, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setPendingEmail } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setUsernameError(null);
    setEmailError(null);
    setGeneralError(null);

    if (!username.trim()) {
      setUsernameError('Username is required.');
      return;
    }
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    setSubmitting(true);
    try {
      await register(username.trim(), email.trim());
      setPendingEmail(email.trim());
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim(), mode: 'register' } });
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.code === 'USERNAME_TAKEN') setUsernameError(err.message);
        else if (err.code === 'INVALID_EMAIL') setEmailError(err.message);
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
          Create your account
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: typography.size.sm, marginTop: spacing.xs, marginBottom: spacing.xl }}>
          Just a username and email — no password needed.
        </Text>

        <AuthInput
          label="Username"
          placeholder="yourname"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={setUsername}
          error={usernameError}
        />
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
              Continue
            </Text>
          )}
        </Pressable>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.textMuted, fontSize: typography.size.sm }}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text style={{ color: colors.primary, fontSize: typography.size.sm, fontWeight: '700' }}>
                Log in
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
