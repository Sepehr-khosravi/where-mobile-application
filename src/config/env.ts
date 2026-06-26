/**
 * config/env.ts
 *
 * ⚠️ STILL NEEDS YOUR ACTUAL VALUES — your Nest log confirmed routes
 * exist but didn't show which host/port it's listening on.
 *
 * Single place that knows where your server lives. Everything else
 * (services/apiClient.ts, services/socket.ts) imports from here —
 * change the URL once, it's correct everywhere.
 *
 * If testing on a physical phone or Android emulator (NOT a simulator
 * on the same machine), 'localhost' won't work — Expo Go on a real
 * device can't reach your computer's localhost. Use your computer's
 * actual LAN IP instead (e.g. 'http://192.168.1.42:3000'), found via
 * `ipconfig` (Windows) or `ifconfig` / `ip addr` (Mac/Linux). Android
 * emulator specifically can use 'http://10.0.2.2:PORT' to reach your
 * host machine's localhost.
 */

export const ENV = {
  // TODO: replace with your real API base URL + port
  API_BASE_URL: 'http://192.168.1.8:8080',

  // TODO: replace with your real Socket.IO server URL — often the
  // same host as the API; confirm if it's a different port for sockets
  SOCKET_URL: 'http://192.168.1.8:8080',
} as const;
