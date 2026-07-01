// src/hooks/useUserLocation.ts
import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';

interface LocationData {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

export function useUserLocation(userId: string | undefined) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const friendId = Number(userId);
    if (isNaN(friendId)) {
      setError(new Error('Invalid user ID'));
      setLoading(false);
      return;
    }

    let cancelled = false;
    let cleanupFn: (() => void) | undefined;

    // تایم‌اوت ۱۰ ثانیه‌ای – اگر لوکیشن نیومد، خطا بده (نه فالی‌بک)
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        setLoading(false);
        setError(new Error('Location timeout – friend might be offline'));
        console.log('⏰ Location timeout – no location received');
      }
    }, 10000);

    const start = async () => {
      try {
        await connectSocket();
        const socket = await getSocket();

        socket.emit('friend:watch', { friendId });
        console.log(`🔭 Watching friend ${friendId}`);

        const handler = (payload: any) => {
          if (payload.userId === friendId) {
            setLocation({
              latitude: payload.latitude,
              longitude: payload.longitude,
              updatedAt: payload.updatedAt,
            });
            setLoading(false);
            setError(null);
            console.log(`📍 Received location for ${friendId}:`, payload.latitude, payload.longitude);
            clearTimeout(timeout);
          }
        };

        socket.on('friend:location', handler);

        cleanupFn = () => {
          if (!cancelled) {
            socket.off('friend:location', handler);
            socket.emit('friend:unwatch', { friendId });
            console.log(`👋 Unwatched friend ${friendId}`);
          }
        };
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Connection failed'));
          setLoading(false);
          clearTimeout(timeout);
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanupFn?.();
    };
  }, [userId]);

  return { location, loading, error };
}