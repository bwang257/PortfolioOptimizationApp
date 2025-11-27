interface Props {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  calmar_ratio: number | null;
  max_drawdown: number | null;
  total_leverage: number | null;
}

const metricTooltips: Record<string, string> = {
  'Expected Return': 'Annualized expected return of the portfolio based on historical data',
  'Volatility': 'Annualized standard deviation of returns (risk measure). Lower is generally better',
  'Sharpe Ratio': 'Risk-adjusted return measure. Higher is better. Compares excess return to volatility',
  'Sortino Ratio': 'Risk-adjusted return focusing on downside risk only. Higher is better',
  'Calmar Ratio': 'Return per unit of maximum drawdown. Higher is better',
  'Max Drawdown': 'Largest peak-to-trough decline in portfolio value. Lower (less negative) is better',
  'Total Leverage': 'Sum of absolute position weights. >1.0 indicates leveraged positions'
};

export default function MetricsTable({
  expected_return,
  volatility,
  sharpe_ratio,
  sortino_ratio,
  calmar_ratio,
  max_drawdown,
  total_leverage
}: Props) {
  const metrics = [
    { label: 'Expected Return', value: `${(expected_return * 100).toFixed(2)}%`, color: 'blue' },
    { label: 'Volatility', value: `${(volatility * 100).toFixed(2)}%`, color: 'green' },
    { label: 'Sharpe Ratio', value: sharpe_ratio?.toFixed(2) || 'N/A', color: 'purple' },
    { label: 'Sortino Ratio', value: sortino_ratio?.toFixed(2) || 'N/A', color: 'indigo' },
    { label: 'Calmar Ratio', value: calmar_ratio?.toFixed(2) || 'N/A', color: 'pink' },
    { label: 'Max Drawdown', value: `${((max_drawdown || 0) * 100).toFixed(2)}%`, color: 'red' },
  ];

  if (total_leverage) {
    metrics.push({ label: 'Total Leverage', value: total_leverage.toFixed(2), color: 'yellow' });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div 
          key={metric.label} 
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden transition-smooth hover-lift cursor-default relative group"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
              {metric.label}
            </p>
            {metricTooltips[metric.label] && (
              <div className="ml-2 flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {metricTooltips[metric.label]}
                </div>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}