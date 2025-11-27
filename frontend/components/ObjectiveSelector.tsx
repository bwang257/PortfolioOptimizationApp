'use client';

interface ObjectiveSelectorProps {
  value: 'sharpe' | 'sortino' | 'calmar' | 'min_variance';
  onChange: (value: 'sharpe' | 'sortino' | 'calmar' | 'min_variance') => void;
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
  const options = [
    { value: 'sharpe' as const, label: 'Sharpe Ratio', description: 'Return per unit of total risk' },
    { value: 'sortino' as const, label: 'Sortino Ratio', description: 'Return per unit of downside risk' },
    { value: 'calmar' as const, label: 'Calmar Ratio', description: 'Return per unit of max drawdown' },
    { value: 'min_variance' as const, label: 'Minimum Variance (Lowest Risk)', description: 'Minimize portfolio volatility' },
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
            className={`flex items-start p-3 border rounded-md cursor-pointer transition-smooth hover-lift ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 hover:shadow-sm'
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
