// src/hooks/useBackgroundLocation.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { LOCATION_TASK_NAME } from '../services/backgroundLocation';

export function useBackgroundLocation(enabled: boolean) {
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!enabled) {
      if (isTracking) stopTracking();
      return;
    }

    startTracking();

    return () => {
      stopTracking();
    };
  }, [enabled]);

  const requestPermissions = async (): Promise<boolean> => {
    const fg = await Location.requestForegroundPermissionsAsync();
    if (fg.status !== 'granted') {
      console.warn('❌ Foreground permission denied');
      // You could show an alert here, but for now just return false
      return false;
    }

    // Background permission (optional but needed for background)
    const bg = await Location.requestBackgroundPermissionsAsync();
    if (bg.status !== 'granted') {
      console.warn('⚠️ Background permission denied – only foreground tracking will work');
      // On Android, background is not available in Expo Go anyway.
      // We can still proceed with foreground only.
    }
    return true;
  };

  const startTracking = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Cannot start tracking without foreground permission');
      return;
    }
    setPermissionGranted(true);

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100,      // 100 meters
        timeInterval: 5000,
        foregroundService: {
          notificationTitle: 'Sharing location',
          notificationBody: 'Your friends can see you',
          notificationColor: '#7C6CF0',
        },
      });
      setIsTracking(true);
      console.log('✅ Background location started');
    } catch (err) {
      console.error('❌ Failed to start background location:', err);
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
      console.log('⏹️ Background location stopped');
    } catch (err) {
      console.warn('Error stopping background location:', err);
    }
  };

  return { isTracking, permissionGranted };
}