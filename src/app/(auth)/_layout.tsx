/**
 * app/(auth)/_layout.tsx
 *
 * Plain stack for login/register/verify — no tab bar (this group
 * sits outside (tabs) entirely), no native header (each screen
 * builds its own in-content header for full control over spacing/
 * safe-area, same pattern as the rest of the app).
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation : "containedTransparentModal", animation : "slide_from_right" }}>
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
