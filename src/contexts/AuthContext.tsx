/**
 * contexts/AuthContext.tsx
 *
 * Single source of truth for "where should the app route the person
 * right now." Three states drive routing in app/_layout.tsx:
 *  - isLoading: still checking AsyncStorage, show nothing/splash
 *  - hasSeenOnboarding: false -> show onboarding
 *  - isAuthenticated: false (but onboarding seen) -> show auth stack
 *  - isAuthenticated: true -> show the main app (tabs)
 */

import {
  clearSessionToken,
  getSessionToken,
  hasSeenOnboarding as readOnboardingSeen,
  saveSessionToken,
  markOnboardingSeen as writeOnboardingSeen,
} from '@/services/authStorage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';


interface AuthContextValue {
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  isAuthenticated: boolean;
  pendingEmail: string | null; // email currently going through verify-code step
  completeOnboarding: () => Promise<void>;
  setPendingEmail: (email: string | null) => void;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [seen, token] = await Promise.all([readOnboardingSeen(), getSessionToken()]);
      setHasSeenOnboarding(seen);
      setIsAuthenticated(!!token);
      setIsLoading(false);
    })();
  }, []);

  const completeOnboarding = useCallback(async () => {
    await writeOnboardingSeen();
    setHasSeenOnboarding(true);
  }, []);

  const signIn = useCallback(async (token: string) => {
    await saveSessionToken(token);
    setPendingEmail(null);
    setIsAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearSessionToken();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        hasSeenOnboarding,
        isAuthenticated,
        pendingEmail,
        completeOnboarding,
        setPendingEmail,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() must be used inside an <AuthProvider>');
  }
  return ctx;
}
