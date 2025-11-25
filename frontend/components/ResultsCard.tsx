interface Props {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  calmar_ratio: number | null;
  max_drawdown: number | null;
  total_leverage: number | null;
}

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
      {metrics.map((metric) => (
        <div 
          key={metric.label} 
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words">
            {metric.label}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}