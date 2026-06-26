/**
 * theme/ThemeContext.tsx
 *
 * Provides the active theme (colors + tokens) to the whole app,
 * and a way to change it from anywhere with setMode().
 *
 * Modes:
 *  - 'system' -> follows the OS light/dark setting (default)
 *  - 'light'  -> forced light
 *  - 'dark'   -> forced dark
 *
 * Preference is persisted to AsyncStorage so it survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import {
  darkColors,
  lightColors,
  radius,
  spacing,
  ThemeColors,
  typography,
} from './colors';

export type ThemeMode = 'system' | 'light' | 'dark';
type ActiveScheme = 'light' | 'dark';

interface ThemeContextValue {
  mode: ThemeMode;          // what the user picked ('system' | 'light' | 'dark')
  scheme: ActiveScheme;     // what's actually being shown right now
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;       // convenience: light <-> dark
  isLoading: boolean;
}

const STORAGE_KEY = '@theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveScheme(mode: ThemeMode, systemScheme: ColorSchemeName): ActiveScheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for OS theme changes (only matters when mode === 'system')
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {
      // Non-fatal: preference just won't persist this time
    });
  };

  const scheme = resolveScheme(mode, systemScheme);

  const toggle = () => {
    // Flips relative to what's currently SHOWN, regardless of mode
    setMode(scheme === 'dark' ? 'light' : 'dark');
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      colors: scheme === 'dark' ? darkColors : lightColors,
      spacing,
      radius,
      typography,
      setMode,
      toggle,
      isLoading,
    }),
    [mode, scheme, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used inside a <ThemeProvider>');
  }
  return ctx;
}
