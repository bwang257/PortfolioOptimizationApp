'use client';

interface PortfolioTypeSelectorProps {
  value: 'long_only' | 'long_short';
  onChange: (value: 'long_only' | 'long_short') => void;
}

export default function PortfolioTypeSelector({ value, onChange }: PortfolioTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Portfolio Type
      </label>
      <div className="space-y-2">
        <label
          onClick={() => onChange('long_only')}
          className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
            value === 'long_only'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
          }`}
        >
          <input
            type="radio"
            name="portfolio_type"
            value="long_only"
            checked={value === 'long_only'}
            onChange={() => onChange('long_only')}
            onClick={(e) => e.stopPropagation()}
            className="mr-3"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Long-Only</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              All weights ≥ 0, sum to 1
            </div>
          </div>
        </label>
        <label
          onClick={() => onChange('long_short')}
          className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
            value === 'long_short'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
          }`}
        >
          <input
            type="radio"
            name="portfolio_type"
            value="long_short"
            checked={value === 'long_short'}
            onChange={() => onChange('long_short')}
            onClick={(e) => e.stopPropagation()}
            className="mr-3"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Long/Short</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Weights can be negative, leverage cap: 1.5x
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
