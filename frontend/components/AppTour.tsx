'use client';

import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { getTourSteps } from '@/lib/tourSteps';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function AppTour() {
  const { isProMode } = useUserPreferences();
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Delay tour start slightly for better UX
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  return (
    <Joyride
      steps={getTourSteps(isProMode)}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: '#10b981', // emerald-500
          zIndex: 10000
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px'
        },
        buttonNext: {
          backgroundColor: '#10b981',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: '600'
        },
        buttonBack: {
          color: '#6b7280',
          marginRight: '10px'
        },
        buttonSkip: {
          color: '#6b7280'
        }
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip tour'
      }}
    />
  );
}

