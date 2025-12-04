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
        { value: 'sortino' as const, label: 'Downside Protection', description: 'Focus on protecting against losses' },
        { value: 'calmar' as const, label: 'Recovery Strength', description: 'Prioritize quick recovery from market downturns' },
        { value: 'min_variance' as const, label: 'Stability First', description: 'Minimize price fluctuations for steady growth' },
      ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Optimization Objective
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-start p-4 border rounded-card-sm cursor-pointer transition-all duration-200 ${
              value === option.value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm bg-white dark:bg-gray-800'
            }`}
          >
            <input
              type="radio"
              name="objective"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {option.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {option.description}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
