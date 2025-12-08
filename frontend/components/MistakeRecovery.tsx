'use client';

import { useState } from 'react';
import { Mistake } from '@/lib/mistakeAnalysis';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useRouter } from 'next/navigation';

interface MistakeRecoveryProps {
  mistakes: Mistake[];
  onDismiss: () => void;
}

export default function MistakeRecovery({ mistakes, onDismiss }: MistakeRecoveryProps) {
  const { isProMode } = useUserPreferences();
  const router = useRouter();
  const [currentMistakeIndex, setCurrentMistakeIndex] = useState(0);

  if (mistakes.length === 0) return null;

  const currentMistake = mistakes[currentMistakeIndex];
  const isLast = currentMistakeIndex === mistakes.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDismiss();
    } else {
      setCurrentMistakeIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentMistakeIndex > 0) {
      setCurrentMistakeIndex(prev => prev - 1);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Learning Moment</h2>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        {mistakes.length > 1 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Issue {currentMistakeIndex + 1} of {mistakes.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentMistakeIndex + 1) / mistakes.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Mistake Content */}
        <div className={`rounded-lg border-2 p-4 mb-4 ${getSeverityColor(currentMistake.severity)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold">{currentMistake.message}</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-white/50 dark:bg-gray-800/50 rounded">
              {currentMistake.severity.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">What's happening?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentMistake.explanation}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How to fix it:</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentMistake.suggestion}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentMistakeIndex === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentMistakeIndex === 0
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Previous
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => router.push('/optimize')}
              className="px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
            >
              Optimize Again
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

