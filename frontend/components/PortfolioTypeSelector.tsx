'use client';

import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface PortfolioTypeSelectorProps {
  value: 'long_only' | 'long_short';
  onChange: (value: 'long_only' | 'long_short') => void;
}

export default function PortfolioTypeSelector({ value, onChange }: PortfolioTypeSelectorProps) {
  const { isProMode } = useUserPreferences();
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
        Portfolio Type
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange('long_only')}
          className={`
            relative p-6 rounded-2xl cursor-pointer transition-all duration-300 text-left
            ${value === 'long_only'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-gray-800 hover:shadow-md shadow-sm'
            }
          `}
        >
          <div className="font-bold text-slate-900 dark:text-white text-base mb-1 tracking-tight">
            {isProMode ? 'Long-Only' : 'Buy Only'}
          </div>
          <div className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            {isProMode ? 'All weights ≥ 0, sum to 1' : 'Only buy positions, no selling'}
          </div>
          {value === 'long_only' && (
            <div className="absolute top-3 right-3">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={() => onChange('long_short')}
          className={`
            relative p-6 rounded-2xl cursor-pointer transition-all duration-300 text-left
            ${value === 'long_short'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-gray-800 hover:shadow-md shadow-sm'
            }
          `}
        >
          <div className="font-bold text-slate-900 dark:text-white text-base mb-1 tracking-tight">
            {isProMode ? 'Long/Short' : 'Buy/Sell'}
          </div>
          <div className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
            {isProMode ? 'Weights can be negative, leverage cap: 1.5x' : 'Can buy and sell positions, leverage cap: 1.5x'}
          </div>
          {value === 'long_short' && (
            <div className="absolute top-3 right-3">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
