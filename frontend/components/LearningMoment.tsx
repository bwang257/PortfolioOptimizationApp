'use client';

import { useState, useEffect } from 'react';
import { PortfolioResponse } from '@/lib/api';
import { analyzePortfolioForMistakes } from '@/lib/mistakeAnalysis';
import MistakeRecovery from './MistakeRecovery';

interface LearningMomentProps {
  portfolioData: PortfolioResponse;
  onDismiss: () => void;
}

export default function LearningMoment({ portfolioData, onDismiss }: LearningMomentProps) {
  const [mistakes, setMistakes] = useState(analyzePortfolioForMistakes(portfolioData));
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const detected = analyzePortfolioForMistakes(portfolioData);
    setMistakes(detected);
    if (detected.length > 0) {
      setShowRecovery(true);
    }
  }, [portfolioData]);

  if (mistakes.length === 0 || !showRecovery) {
    return null;
  }

  return (
    <MistakeRecovery
      mistakes={mistakes}
      onDismiss={() => {
        setShowRecovery(false);
        onDismiss();
      }}
    />
  );
}

