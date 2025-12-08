'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserGoal = 'grow_wealth' | 'protect_savings' | 'active_trading';
export type KnowledgeLevel = 'new' | 'basics' | 'advanced';

interface UserPreferencesContextType {
  isProMode: boolean;
  toggleProMode: () => void;
  userGoal: UserGoal | null;
  knowledgeLevel: KnowledgeLevel | null;
  hasCompletedOnboarding: boolean;
  setUserGoal: (goal: UserGoal) => void;
  setKnowledgeLevel: (level: KnowledgeLevel) => void;
  completeOnboarding: (goal: UserGoal, level: KnowledgeLevel) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [isProMode, setIsProMode] = useState<boolean>(false);
  const [userGoal, setUserGoalState] = useState<UserGoal | null>(null);
  const [knowledgeLevel, setKnowledgeLevelState] = useState<KnowledgeLevel | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem('isProMode');
      if (storedMode !== null) {
        setIsProMode(storedMode === 'true');
      }
      
      const storedGoal = localStorage.getItem('userGoal');
      if (storedGoal) {
        setUserGoalState(storedGoal as UserGoal);
      }
      
      const storedLevel = localStorage.getItem('knowledgeLevel');
      if (storedLevel) {
        setKnowledgeLevelState(storedLevel as KnowledgeLevel);
      }
      
      const storedOnboarding = localStorage.getItem('hasCompletedOnboarding');
      if (storedOnboarding === 'true') {
        setHasCompletedOnboarding(true);
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

  useEffect(() => {
    try {
      if (userGoal) {
        localStorage.setItem('userGoal', userGoal);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [userGoal]);

  useEffect(() => {
    try {
      if (knowledgeLevel) {
        localStorage.setItem('knowledgeLevel', knowledgeLevel);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [knowledgeLevel]);

  useEffect(() => {
    try {
      localStorage.setItem('hasCompletedOnboarding', String(hasCompletedOnboarding));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [hasCompletedOnboarding]);

  const toggleProMode = () => {
    setIsProMode(prev => !prev);
  };

  const setUserGoal = (goal: UserGoal) => {
    setUserGoalState(goal);
  };

  const setKnowledgeLevel = (level: KnowledgeLevel) => {
    setKnowledgeLevelState(level);
    // Auto-set Pro mode based on knowledge level
    if (level === 'advanced') {
      setIsProMode(true);
    } else if (level === 'new') {
      setIsProMode(false);
    }
  };

  const completeOnboarding = (goal: UserGoal, level: KnowledgeLevel) => {
    setUserGoalState(goal);
    setKnowledgeLevelState(level);
    setHasCompletedOnboarding(true);
    // Auto-set Pro mode based on knowledge level
    if (level === 'advanced') {
      setIsProMode(true);
    } else if (level === 'new') {
      setIsProMode(false);
    }
  };

  return (
    <UserPreferencesContext.Provider value={{ 
      isProMode, 
      toggleProMode,
      userGoal,
      knowledgeLevel,
      hasCompletedOnboarding,
      setUserGoal,
      setKnowledgeLevel,
      completeOnboarding
    }}>
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

