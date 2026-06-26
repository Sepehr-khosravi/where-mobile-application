/**
 * hooks/useUserProfile.ts
 */

import { useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/api';
import { UserProfileDTO } from '../types/api';

interface UseUserProfileResult {
  profile: UserProfileDTO | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useUserProfile(userId: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(userId);
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile'));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, loading, error, reload: load };
}
