'use client';

interface ObjectiveSelectorProps {
  value: 'sharpe' | 'sortino' | 'calmar';
  onChange: (value: 'sharpe' | 'sortino' | 'calmar') => void;
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
  const options = [
    { value: 'sharpe' as const, label: 'Sharpe Ratio', description: 'Return per unit of total risk' },
    { value: 'sortino' as const, label: 'Sortino Ratio', description: 'Return per unit of downside risk' },
    { value: 'calmar' as const, label: 'Calmar Ratio', description: 'Return per unit of max drawdown' },
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
            className={`flex items-start p-3 border rounded-md cursor-pointer transition-colors ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="objective"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as 'sharpe' | 'sortino' | 'calmar')}
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