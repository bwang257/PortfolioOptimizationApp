'use client';

import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface ObjectiveSelectorProps {
  value: 'sharpe' | 'sortino' | 'calmar' | 'min_variance';
  onChange: (value: 'sharpe' | 'sortino' | 'calmar' | 'min_variance') => void;
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
  const { isProMode } = useUserPreferences();

  const options = isProMode
    ? [
        { value: 'sharpe' as const, label: 'Sharpe Ratio', description: 'Return per unit of total risk' },
        { value: 'sortino' as const, label: 'Sortino Ratio', description: 'Return per unit of downside risk' },
        { value: 'calmar' as const, label: 'Calmar Ratio', description: 'Return per unit of max drawdown' },
        { value: 'min_variance' as const, label: 'Minimum Variance (Lowest Risk)', description: 'Minimize portfolio volatility' },
      ]
    : [
        { value: 'sharpe' as const, label: 'Balanced Growth', description: 'Maximize returns while managing overall risk' },
        { value: 'sortino' as const, label: 'Downside Protection Score', description: 'Focus on protecting against losses' },
        { value: 'calmar' as const, label: 'Recovery Strength Score', description: 'Prioritize quick recovery from market downturns' },
        { value: 'min_variance' as const, label: 'Stability First', description: 'Minimize price fluctuations for steady growth' },
      ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
        Optimization Objective
      </label>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative p-6 rounded-2xl cursor-pointer transition-all duration-300 text-left
              ${value === option.value
                ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-2 ring-emerald-500 shadow-md scale-[1.02]'
                : 'bg-white dark:bg-gray-800 hover:shadow-md shadow-sm'
              }
            `}
          >
            <div className="font-bold text-slate-900 dark:text-white text-base mb-1 tracking-tight">
              {option.label}
            </div>
            <div className="text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
              {option.description}
            </div>
            {value === option.value && (
              <div className="absolute top-3 right-3">
                <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
