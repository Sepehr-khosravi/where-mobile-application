// app/_layout.tsx
import { useBackgroundLocation } from '@/hooks/useBackgroundLocation';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LocationSharingProvider, useLocationSharing } from '../contexts/LocationSharingContext';
import { ThemeProvider, useTheme } from '../theme/ThemeContext';

function RootLayoutContent() {
  const { colors, scheme } = useTheme();
  const { isLoading, hasSeenOnboarding, isAuthenticated } = useAuth();
  const { isEnabled: locationSharingEnabled } = useLocationSharing();
  const router = useRouter();
  const segments = useSegments();

  // 🔥 Start background tracking only if user is authenticated AND location sharing is enabled
  const { isTracking, permissionGranted } = useBackgroundLocation(
    !!(isAuthenticated && locationSharingEnabled)
  );

  useEffect(() => {
    if (isAuthenticated) {
      console.log('📍 Location sharing enabled:', locationSharingEnabled);
      console.log('📡 Background tracking active:', isTracking);
      console.log('🔑 Permission granted:', permissionGranted);
    }
  }, [isAuthenticated, locationSharingEnabled, isTracking, permissionGranted]);

  // ... navigation gatekeeper (same as before)
  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = segments[0] === 'onboarding';
    if (!hasSeenOnboarding && !onOnboarding) {
      router.push('/onboarding');
    } else if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup && !onOnboarding) {
      router.push('/(auth)/register');
    } else if (isAuthenticated && (inAuthGroup || onOnboarding)) {
      router.push('/(tabs)');
    }
  }, [isLoading, hasSeenOnboarding, isAuthenticated, segments, router]);

  const navigationTheme = {
    ...(scheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme),
    colors: {
      ...(scheme === 'dark' ? NavigationDarkTheme.colors : NavigationLightTheme.colors),
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          presentation: 'containedTransparentModal',
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="search"
          options={{ presentation: 'containedTransparentModal', headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="invites"
          options={{ presentation: 'containedTransparentModal', headerShown: false, animation: 'slide_from_right' }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationSharingProvider>
            <RootLayoutContent />
          </LocationSharingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}