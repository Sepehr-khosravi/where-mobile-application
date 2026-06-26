/**
 * data/mockUsers.ts
 *
 * Stand-in data source. Swap getMyRelations()/searchUsers() bodies
 * for real API calls later — the screens don't need to change.
 */

import { getCurrentDeviceLocation, watchDeviceLocation } from '../services/deviceLocation';
import { UserLocationDTO, UserProfileDTO } from '../types/api';
import { Relation, RelationStatus, User } from '../types/user';

const AVATAR_COLORS = ['#FF6B5B', '#4F86F7', '#22C55E', '#F59E0B', '#A855F7', '#EC4899'];

function colorFor(seed: string) {
  const idx = seed.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export const CURRENT_USER: User = {
  id: 'me',
  username: 'you.codes',
  email: 'you@example.com',
  avatarColor: colorFor('y'),
};

const ALL_USERS: User[] = [
  { id: '1', username: 'maria_dev', email: 'maria@example.com', avatarColor: colorFor('m') },
  { id: '2', username: 'jonas_b', email: 'jonas@example.com', avatarColor: colorFor('j') },
  { id: '3', username: 'elif.k', email: 'elif@example.com', avatarColor: colorFor('e') },
  { id: '4', username: 'sam_codes', email: 'sam@example.com', avatarColor: colorFor('s') },
  { id: '5', username: 'priya.r', email: 'priya@example.com', avatarColor: colorFor('p') },
  { id: '6', username: 'tomasz_w', email: 'tomasz@example.com', avatarColor: colorFor('t') },
  { id: '7', username: 'aiko_n', email: 'aiko@example.com', avatarColor: colorFor('a') },
  { id: '8', username: 'lucas.m', email: 'lucas@example.com', avatarColor: colorFor('l') },
];

// --- Set this to [] to see the empty state on Home ---
const MY_RELATIONS: Relation[] = [
  { user: ALL_USERS[0], status: 'friend', lastActive: 'Active now' },
  { user: ALL_USERS[1], status: 'friend', lastActive: '2h ago' },
  { user: ALL_USERS[2], status: 'friend', lastActive: '1d ago' },
  { user: ALL_USERS[4], status: 'pending_sent', lastActive: undefined },
];

// Starting point per user — a few real cities, just for a believable demo.
const MOCK_BASE_LOCATIONS: Record<string, { latitude: number; longitude: number }> = {
  '1': { latitude: 53.5511, longitude: 9.9937 },   // Hamburg
  '2': { latitude: 52.52, longitude: 13.405 },     // Berlin
  '3': { latitude: 41.0082, longitude: 28.9784 },  // Istanbul
  '4': { latitude: 40.7128, longitude: -74.006 },  // New York
  '5': { latitude: 28.6139, longitude: 77.209 },   // Delhi
  '6': { latitude: 52.2297, longitude: 21.0122 },  // Warsaw
  '7': { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
  '8': { latitude: -23.5505, longitude: -46.6333 },// São Paulo
};

export async function getMyRelations(): Promise<Relation[]> {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 200));
  return MY_RELATIONS;
}

export async function searchUsers(query: string): Promise<User[]> {
  await new Promise((r) => setTimeout(r, 150));
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_USERS.filter(
    (u) =>
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  );
}

export function getRelationStatus(userId: string): RelationStatus {
  const found = MY_RELATIONS.find((r) => r.user.id === userId);
  return found?.status ?? 'none';
}

/**
 * --- Mock versions of the real services/api.ts + services/socket.ts ---
 *
 * These exist ONLY so app/user/[id].tsx has something real to render
 * before your backend exists. Once you wire the real server, the
 * screen should import from services/api.ts and services/socket.ts
 * instead of these — same function names/shapes, real network calls.
 */

function findUser(userId: string): User | undefined {
  if (userId === CURRENT_USER.id) return CURRENT_USER;
  return ALL_USERS.find((u) => u.id === userId);
}

export async function getMockUserProfile(userId: string): Promise<UserProfileDTO> {
  await new Promise((r) => setTimeout(r, 300));
  const user = findUser(userId);
  if (!user) throw new Error(`No mock user with id ${userId}`);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
}

export async function getMockUserLocation(userId: string): Promise<UserLocationDTO> {
  // 'me' uses the actual phone GPS instead of a fake city — see
  // services/deviceLocation.ts. Every other mock user keeps the
  // simulated city-based location below, untouched.
  if (userId === CURRENT_USER.id) {
    const point = await getCurrentDeviceLocation();
    return {
      userId,
      latitude: point.latitude,
      longitude: point.longitude,
      updatedAt: new Date(point.timestamp).toISOString(),
    };
  }

  await new Promise((r) => setTimeout(r, 300));
  const base = MOCK_BASE_LOCATIONS[userId] ?? MOCK_BASE_LOCATIONS['1'];
  return {
    userId,
    latitude: base.latitude,
    longitude: base.longitude,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Simulates a live socket feed: every few seconds, nudges the user's
 * location slightly, like they're walking around. Mirrors the exact
 * shape of services/socket.ts's onUserLocationUpdate() — same
 * (userId, callback) => unsubscribe signature — so swapping the real
 * one in later is a one-line import change in the screen, nothing else.
 */
export function onMockUserLocationUpdate(
  userId: string,
  callback: (location: UserLocationDTO) => void
): () => void {
  // 'me' gets real GPS updates (gated by the 100m-moved threshold —
  // see services/deviceLocation.ts). Every other mock user keeps the
  // simulated random-drift movement below, untouched.
  if (userId === CURRENT_USER.id) {
    return watchDeviceLocation((point) => {
      callback({
        userId,
        latitude: point.latitude,
        longitude: point.longitude,
        updatedAt: new Date(point.timestamp).toISOString(),
      });
    });
  }

  const base = MOCK_BASE_LOCATIONS[userId] ?? MOCK_BASE_LOCATIONS['1'];
  let lat = base.latitude;
  let lng = base.longitude;

  const interval = setInterval(() => {
    // Small random drift, roughly block-by-block movement
    lat += (Math.random() - 0.5) * 0.004;
    lng += (Math.random() - 0.5) * 0.004;
    callback({
      userId,
      latitude: lat,
      longitude: lng,
      updatedAt: new Date().toISOString(),
    });
  }, 3000);

  return () => clearInterval(interval);
}