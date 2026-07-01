// src/hooks/useBackgroundLocation.ts
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { LOCATION_TASK_NAME } from '../services/backgroundLocation';
import { connectSocket, getSocket } from '../services/socket';

export function useBackgroundLocation(enabled: boolean) {
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastManualSend = useRef(0);
  const mounted = useRef(true);
  const isStarting = useRef(false);

  // ---- تابع امن برای ارسال موقعیت یکبار ----
  const sendLocationOnce = async (): Promise<boolean> => {
    if (!enabled || !mounted.current) return false;

    try {
      // بررسی مجوز بدون درخواست مجدد (برای جلوگیری از مزاحمت UI)
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return false;

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude, accuracy } = loc.coords;

      if (accuracy && accuracy > 150) return false;

      // اتصال به سوکت با timeout
      let socket = await getSocket();
      if (!socket || !socket.connected) {
        try {
          await Promise.race([
            connectSocket(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
          ]);
          socket = await getSocket();
        } catch (_) {
          return false;
        }
      }

      if (socket && socket.connected) {
        socket.emit('location:update', { latitude, longitude });
        lastManualSend.current = Date.now();
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  // ---- ارسال موقعیت در foreground ----
  useEffect(() => {
    if (!enabled || !mounted.current) return;

    const timer = setTimeout(() => {
      sendLocationOnce();
    }, 1500);

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (appState.current === 'background' && nextState === 'active') {
        if (mounted.current && enabled) {
          const now = Date.now();
          if (now - lastManualSend.current > 10000) {
            sendLocationOnce();
          }
        }
      }
      appState.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [enabled]);

  // ---- درخواست مجوز ----
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== 'granted') return false;

      if (Platform.OS === 'android') {
        const bg = await Location.requestBackgroundPermissionsAsync();
        if (bg.status !== 'granted') {
          // فقط هشدار، ادامه بده
        }
      }
      return true;
    } catch (_) {
      return false;
    }
  };

  // ---- شروع/توقف تسک پس‌زمینه ----
  const startTracking = async () => {
    if (isStarting.current) return;
    isStarting.current = true;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        isStarting.current = false;
        return;
      }
      setPermissionGranted(true);

      // بررسی کن که تسک قبلاً تعریف شده
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (!isRegistered) {
        // تسک در فایل سرویس تعریف شده، بنابراین نیازی به ثبت مجدد نیست
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        distanceInterval: 100,
        timeInterval: 300000,
        foregroundService: {
          notificationTitle: 'Sharing location',
          notificationBody: 'Your friends can see you',
          notificationColor: '#7C6CF0',
        },
      });
      setIsTracking(true);
    } catch (_) {
      // خطا را نادیده بگیر تا کرش نکنه
    } finally {
      isStarting.current = false;
    }
  };

  const stopTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
    } catch (_) {}
  };

  // ---- کنترل start/stop بر اساس enabled ----
  useEffect(() => {
    if (!enabled) {
      if (isTracking) stopTracking();
      return;
    }

    startTracking();

    return () => {
      // در unmount تسک را متوقف نکن تا در بک‌گراند ادامه پیدا کنه
    };
  }, [enabled]);

  // ---- پاک‌سازی در unmount ----
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return { isTracking, permissionGranted };
}