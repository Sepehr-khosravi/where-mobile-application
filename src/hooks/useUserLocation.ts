// src/hooks/useUserLocation.ts
import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../services/socket';

interface LocationData {
  latitude: number;
  longitude: number;
  updatedAt: string;
}

// Default fallback location (New York, you can change)
const FALLBACK_LOCATION: LocationData = {
  latitude: 40.7128,
  longitude: -74.0060,
  updatedAt: new Date().toISOString(),
};

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

    // 🔥 Fallback: after 5 seconds, if no location received, set default
    const timeout = setTimeout(() => {
      if (!cancelled && loading) {
        setLoading(false);
        setLocation(FALLBACK_LOCATION);
        console.log('⏰ Location timeout – using fallback (NYC)');
      }
    }, 5000);

    const start = async () => {
      try {
        await connectSocket();
        const socket = await getSocket();

        // Emit watch event
        socket.emit('friend:watch', { friendId });
        console.log(`🔭 Watching friend ${friendId}`);

        // Handler for location updates
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
            // Clear the timeout since we got a real location
            clearTimeout(timeout);
          }
        };

        socket.on('friend:location', handler);

        // Cleanup function
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