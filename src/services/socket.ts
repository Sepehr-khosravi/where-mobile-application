/**
 * services/socket.ts
 *
 * Real implementation against your confirmed SocketGateway events:
 *   'friend:location'   server -> client, a friend's location changed
 *   'friend:watch'      client -> server, "start sending me X's updates"
 *   'friend:unwatch'    client -> server, "stop sending me X's updates"
 *   'ping'               client <-> server, heartbeat
 *
 * Single Socket.IO connection for the whole app (singleton pattern).
 */

import { io, Socket } from 'socket.io-client';
import { ENV } from '../config/env';
import { UserLocationDTO } from '../types/api';
import { getSessionToken } from './authStorage';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  const token = await getSessionToken();

  if (!socket) {
    socket = io(ENV.SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      auth: { token },
    });
  } else {
    socket.auth = { token };
  }

  return socket;
}

export async function connectSocket(): Promise<void> {
  const s = await getSocket();
  if (!s.connected) {
    s.connect();
    // 🔥 Wait for actual connection (or error)
    return new Promise((resolve, reject) => {
      s.once('connect', resolve);
      s.once('connect_error', (err) => reject(err));
    });
  }
}

export function disconnectSocket(): void {
  socket?.disconnect();
}

/**
 * Subscribe to live location updates for a specific friend.
 * Returns an unsubscribe function — call it in a useEffect cleanup.
 */
export async function onUserLocationUpdate(
  userId: string,
  callback: (location: UserLocationDTO) => void
): Promise<() => void> {
  const s = await getSocket();

  // Ensure socket is connected
  if (!s.connected) {
    await connectSocket();
  }

  // Tell server we want to watch this friend
  s.emit('friend:watch', { friendId: Number(userId) });
  console.log(`🔭 Watching friend ${userId}`);

  // Listen to the correct event: 'friend:location'
  const handler = (payload: UserLocationDTO) => {
    if (String(payload.userId) === userId) {
      callback(payload);
    }
  };

  s.on('friend:location', handler);

  return () => {
    s.off('friend:location', handler);
    s.emit('friend:unwatch', { friendId: Number(userId) });
    console.log(`👋 Unwatched friend ${userId}`);
  };
}