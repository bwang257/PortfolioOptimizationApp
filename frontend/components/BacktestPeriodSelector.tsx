'use client';

export type BacktestPeriod = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y';

interface BacktestPeriodSelectorProps {
  value: BacktestPeriod;
  onChange: (period: BacktestPeriod) => void;
}

export const PERIOD_TO_DAYS: Record<BacktestPeriod, number> = {
  '1M': 21,   // ~1 month (21 trading days)
  '3M': 63,   // ~3 months (63 trading days)
  '6M': 126,  // ~6 months (126 trading days)
  '1Y': 252,  // ~1 year (252 trading days)
  '2Y': 504,  // ~2 years (504 trading days)
  '5Y': 1260, // ~5 years (1260 trading days)
};

export default function BacktestPeriodSelector({ value, onChange }: BacktestPeriodSelectorProps) {
  const periods: { value: BacktestPeriod; label: string }[] = [
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '2Y', label: '2 Years' },
    { value: '5Y', label: '5 Years' },
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Backtest Period
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as BacktestPeriod)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-smooth"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Select the historical period for backtesting your portfolio
      </p>
    </div>
  );
}

