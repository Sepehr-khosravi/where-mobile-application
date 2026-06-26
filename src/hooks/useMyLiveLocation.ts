/**
 * hooks/useMyLiveLocation.ts
 *
 * Watches the device's real GPS and exposes the current position.
 * Also tracks a separate "last reported" point and only flags
 * `shouldReport: true` once you've moved >= REPORT_THRESHOLD_METERS
 * away from it — that's the actual "send every 100m" rule.
 *
 * IMPORTANT: this hook does NOT send anything to a server itself.
 * It only tells you *when* a report should happen. The actual socket
 * emit is a single clearly-marked TODO at the bottom — wire it in
 * once your server's event name/payload is confirmed.
 */

import { distanceInMeters } from '@/utils/geo';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

const REPORT_THRESHOLD_METERS = 100;

export interface LiveLocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

interface UseMyLiveLocationResult {
  location: LiveLocationPoint | null;
  permissionStatus: Location.PermissionStatus | null;
  errorMessage: string | null;
  totalDistanceSinceLastReport: number;
}

export function useMyLiveLocation(): UseMyLiveLocationResult {
  const [location, setLocation] = useState<LiveLocationPoint | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [totalDistanceSinceLastReport, setTotalDistanceSinceLastReport] = useState(0);

  // The last point we actually "reported" — distance is always
  // measured from here, NOT from the previous raw GPS reading.
  // Otherwise tiny back-and-forth GPS jitter could add up to 100m
  // over time without you having gone anywhere meaningful.
  const lastReportedPoint = useRef<{ latitude: number; longitude: number } | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  const reportLocation = useCallback((point: LiveLocationPoint) => {
    lastReportedPoint.current = { latitude: point.latitude, longitude: point.longitude };
    setTotalDistanceSinceLastReport(0);

    // --- TODO: send to your server here once the socket event is confirmed ---
    // Mirrors the shape services/socket.ts will eventually use, e.g.:
    //   getSocket().emit('location:report', {
    //     latitude: point.latitude,
    //     longitude: point.longitude,
    //     timestamp: point.timestamp,
    //   });
    if (__DEV__) {
      console.log(
        `[live-location] would report to server: ${point.latitude.toFixed(6)}, ${point.longitude.toFixed(6)}`
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;
      setPermissionStatus(status);

      if (status !== Location.PermissionStatus.GRANTED) {
        setErrorMessage('Location permission was not granted.');
        return;
      }

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          // Belt-and-suspenders: ask the OS to throttle samples a bit,
          // even though OUR threshold logic below is what actually
          // decides whether something counts as "moved 100m."
          timeInterval: 2000,
          distanceInterval: 5, // meters — fine-grained raw samples
        },
        (position) => {
          if (!isMounted) return;

          const point: LiveLocationPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          setLocation(point);
          setErrorMessage(null);

          if (!lastReportedPoint.current) {
            // First fix ever — report immediately so there's a
            // starting point on the server, then measure from here.
            reportLocation(point);
            return;
          }

          const moved = distanceInMeters(
            lastReportedPoint.current.latitude,
            lastReportedPoint.current.longitude,
            point.latitude,
            point.longitude
          );

          setTotalDistanceSinceLastReport(moved);

          if (moved >= REPORT_THRESHOLD_METERS) {
            reportLocation(point);
          }
        }
      );
    }

    start().catch((err) => {
      if (isMounted) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to start location updates.');
      }
    });

    return () => {
      isMounted = false;
      watchSubscription.current?.remove();
    };
  }, [reportLocation]);

  return { location, permissionStatus, errorMessage, totalDistanceSinceLastReport };
}
