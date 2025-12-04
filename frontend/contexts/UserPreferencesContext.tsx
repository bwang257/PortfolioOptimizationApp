'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserPreferencesContextType {
  isProMode: boolean;
  toggleProMode: () => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [isProMode, setIsProMode] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('isProMode');
      if (stored !== null) {
        setIsProMode(stored === 'true');
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('isProMode', String(isProMode));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [isProMode]);

  const toggleProMode = () => {
    setIsProMode(prev => !prev);
  };

  return (
    <UserPreferencesContext.Provider value={{ isProMode, toggleProMode }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

