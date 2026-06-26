import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@location_sharing_enabled';

interface LocationSharingContextType {
  isEnabled: boolean;
  toggle: () => void;
  isLoading: boolean;
}

const LocationSharingContext = createContext<LocationSharingContextType | undefined>(undefined);

export const LocationSharingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(true); // default on
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsEnabled(stored === 'true');
        }
      } catch (error) {
        console.warn('Failed to load location sharing preference', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const toggle = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, String(newValue));
    } catch (error) {
      console.warn('Failed to save location sharing preference', error);
    }
  };

  return (
    <LocationSharingContext.Provider value={{ isEnabled, toggle, isLoading }}>
      {children}
    </LocationSharingContext.Provider>
  );
};

export const useLocationSharing = () => {
  const context = useContext(LocationSharingContext);
  if (!context) {
    throw new Error('useLocationSharing must be used within a LocationSharingProvider');
  }
  return context;
};