'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingQuiz from '@/components/OnboardingQuiz';
import { onboardingQuestions } from '@/lib/onboardingData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { UserGoal, KnowledgeLevel } from '@/contexts/UserPreferencesContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { hasCompletedOnboarding, completeOnboarding } = useUserPreferences();

  // Redirect if already completed onboarding
  useEffect(() => {
    if (hasCompletedOnboarding) {
      router.push('/');
    }
  }, [hasCompletedOnboarding, router]);

  const handleComplete = (goal: UserGoal, level: KnowledgeLevel) => {
    completeOnboarding(goal, level);
    router.push('/');
  };

  const handleSkip = () => {
    // Set defaults and skip
    completeOnboarding('grow_wealth', 'basics');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Welcome to Portfolio Optimizer
          </h1>
          <p className="text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Let's personalize your experience. This quick quiz helps us tailor the app to your needs.
          </p>
        </div>

        {/* Quiz */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-12">
          <OnboardingQuiz
            questions={onboardingQuestions}
            onComplete={handleComplete}
            onSkip={handleSkip}
          />
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-gray-500">
            Your answers help us provide the best experience. You can change your preferences anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

