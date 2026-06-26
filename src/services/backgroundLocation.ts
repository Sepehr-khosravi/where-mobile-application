// services/backgroundLocation.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { connectSocket, getSocket } from './socket';

export const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background task error:', error);
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];
  if (!location) return;

  const { latitude, longitude } = location.coords;

  try {
    await connectSocket();
    const socket = await getSocket();
    if (socket.connected) {
      socket.emit('location:update', { latitude, longitude });
      console.log(`📍 [BACKGROUND] sent location: ${latitude}, ${longitude}`);
    } else {
      console.warn('⚠️ [BACKGROUND] socket not connected');
    }
  } catch (err) {
    console.error('❌ [BACKGROUND] failed to send location:', err);
  }
});