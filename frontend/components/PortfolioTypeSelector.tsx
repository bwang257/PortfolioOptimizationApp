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
          className={`flex items-center p-4 border rounded-card-sm cursor-pointer transition-all duration-200 ${
            value === 'long_only'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm bg-white dark:bg-gray-800'
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
          className={`flex items-center p-4 border rounded-card-sm cursor-pointer transition-all duration-200 ${
            value === 'long_short'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm bg-white dark:bg-gray-800'
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
