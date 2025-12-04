'use client';

import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function ProModeToggle() {
  const { isProMode, toggleProMode } = useUserPreferences();

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-card-sm border border-gray-200 dark:border-gray-700 px-3 py-2 shadow-sm">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Mode:</span>
      <button
        onClick={() => {
          if (isProMode) toggleProMode();
        }}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
          !isProMode
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Simple
      </button>
      <button
        onClick={() => {
          if (!isProMode) toggleProMode();
        }}
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
          isProMode
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        Pro
      </button>
    </div>
  );
}

