'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadProgress, ProgressData } from '@/lib/progressTracking';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import Link from 'next/link';

export default function ProgressPage() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useUserPreferences();
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    } else {
      const loaded = loadProgress();
      setProgress(loaded);
    }
  }, [hasCompletedOnboarding, router]);

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading progress...</div>
      </div>
    );
  }

  const earnedBadges = progress.badges.filter(b => b.earned);
  const unearnedBadges = progress.badges.filter(b => !b.earned);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track your learning journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProModeToggle />
            <ThemeToggle />
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Streak Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-2">🔥</div>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {progress.streak}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Day Streak
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Keep it going! Practice daily to maintain your streak.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {progress.totalPortfolios}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Portfolios Created</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {progress.totalNewsAnalyzed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">News Articles Analyzed</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {progress.totalRebalances}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Rebalances Completed</div>
          </div>
        </div>

        {/* Concept Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Concepts Mastered
          </h2>
          <div className="space-y-4">
            {progress.conceptsMastered.map((concept) => (
              <div key={concept.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {concept.name}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {concept.current}/{concept.target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${concept.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Badges ({earnedBadges.length}/{progress.badges.length})
          </h2>
          
          {earnedBadges.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Earned
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
                  >
                    <span className="text-2xl">{badge.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                        {badge.name}
                      </div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-300">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unearnedBadges.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Locked
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unearnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-60"
                  >
                    <span className="text-2xl grayscale">{badge.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-600 dark:text-gray-400">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

