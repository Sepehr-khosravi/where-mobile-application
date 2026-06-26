/**
 * services/deviceLocation.ts
 *
 * The actual "get my own phone's GPS address" service. Wraps
 * expo-location with the same 100m-report-threshold rule you wanted
 * for the eventual socket feature — distance is measured from the
 * last *reported* point, not the last raw GPS sample, so jitter
 * doesn't fake out the threshold.
 *
 * This file knows nothing about mock users or your backend — it only
 * answers "where is this phone, right now, and when has it moved
 * 100m." data/mockUsers.ts wires this into the 'me' user so it flows
 * through the exact same getMockUserLocation/onMockUserLocationUpdate
 * functions every other mock user already uses.
 */

import { distanceInMeters } from '@/utils/geo';
import * as Location from 'expo-location';

export const REPORT_THRESHOLD_METERS = 100;

export interface DeviceLocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

/**
 * One-shot: ask for permission (if not already granted) and return
 * the current GPS fix. Used for the very first load, same role
 * getUserLocation() plays for other users.
 */
export async function getCurrentDeviceLocation(): Promise<DeviceLocationPoint> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Location permission was not granted.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.BestForNavigation,
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    timestamp: position.timestamp,
  };
}

/**
 * Subscribes to live GPS updates and calls `onReport` ONLY when the
 * phone has moved >= REPORT_THRESHOLD_METERS since the last report
 * (or on the very first fix). Returns an unsubscribe function.
 *
 * This is the device-GPS equivalent of onMockUserLocationUpdate() —
 * same (callback) => unsubscribe shape, so data/mockUsers.ts can
 * point 'me' at this instead of the fake-drift simulator.
 */
export function watchDeviceLocation(
  onReport: (point: DeviceLocationPoint) => void
): () => void {
  let cancelled = false;
  let subscription: Location.LocationSubscription | null = null;
  let lastReported: { latitude: number; longitude: number } | null = null;

  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (cancelled || status !== Location.PermissionStatus.GRANTED) return;

    subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 5, // raw GPS sample granularity, not the report threshold
      },
      (position) => {
        const point: DeviceLocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        if (!lastReported) {
          lastReported = { latitude: point.latitude, longitude: point.longitude };
          onReport(point);
          return;
        }

        const moved = distanceInMeters(
          lastReported.latitude,
          lastReported.longitude,
          point.latitude,
          point.longitude
        );

        if (moved >= REPORT_THRESHOLD_METERS) {
          lastReported = { latitude: point.latitude, longitude: point.longitude };
          onReport(point);
        }
      }
    );
  })();

  return () => {
    cancelled = true;
    subscription?.remove();
  };
}
