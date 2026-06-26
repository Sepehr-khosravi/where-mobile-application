/**
 * services/authStorage.ts
 *
 * Thin AsyncStorage wrapper for the two pieces of state the auth
 * flow needs to persist across app restarts:
 *  - has the person seen onboarding before
 *  - the session token, once logged in
 *
 * Kept separate from services/auth.ts (the actual login/verify API
 * calls) so storage concerns don't get tangled with network concerns.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_SEEN_KEY = '@onboarding_seen';
const SESSION_TOKEN_KEY = '@session_token';
export const USER_ID_KEY = '@user_id';

export async function hasSeenOnboarding(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
  return value === 'true';
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
}

export async function getSessionToken(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_TOKEN_KEY);
}

export async function saveSessionToken(token: string): Promise<void> {
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
}

export async function clearSessionToken(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
}

export async function saveUserId(id : number) : Promise<void> {
  await AsyncStorage.setItem(USER_ID_KEY, JSON.stringify(id));
};

export async function getUserId(): Promise<number | null> {
  const id = await AsyncStorage.getItem(USER_ID_KEY);
  console.log('Retrieved userId:', id); // should not be null after login
  return id ? Number(id) : null;
}