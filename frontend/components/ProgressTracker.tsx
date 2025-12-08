'use client';

import { useState, useEffect } from 'react';
import { loadProgress, ProgressData, recordActivity } from '@/lib/progressTracking';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface ProgressTrackerProps {
  onActivity?: (activity: 'portfolio' | 'news' | 'rebalance') => void;
}

export default function ProgressTracker({ onActivity }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const { hasCompletedOnboarding } = useUserPreferences();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      const loaded = loadProgress();
      setProgress(loaded);
    }
  }, [hasCompletedOnboarding]);

  const handleActivity = (activity: 'portfolio' | 'news' | 'rebalance') => {
    if (progress) {
      const updated = recordActivity(activity, progress);
      setProgress(updated);
      onActivity?.(activity);
    }
  };

  // Expose activity handler via ref or context if needed
  // For now, this component just displays progress

  if (!progress) return null;

  const earnedBadges = progress.badges.filter(b => b.earned);
  const unearnedBadges = progress.badges.filter(b => !b.earned);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {progress.streak}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">day streak</span>
        </div>
      </div>

      <div className="space-y-3">
        {progress.conceptsMastered.map((concept) => (
          <div key={concept.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {concept.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {concept.current}/{concept.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${concept.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {earnedBadges.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Earned Badges ({earnedBadges.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded text-xs"
                title={badge.description}
              >
                <span>{badge.icon}</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  {badge.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

