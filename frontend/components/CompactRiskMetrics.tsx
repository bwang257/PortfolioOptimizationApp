'use client';

interface CompactRiskMetricsProps {
  volatility: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  max_drawdown: number | null;
  calmar_ratio: number | null;
  isProMode: boolean;
}

export default function CompactRiskMetrics({
  volatility,
  sharpe_ratio,
  sortino_ratio,
  max_drawdown,
  calmar_ratio,
  isProMode
}: CompactRiskMetricsProps) {
  const metrics = [
    {
      label: isProMode ? 'Volatility' : 'Stability Score',
      value: `${(volatility * 100).toFixed(2)}%`,
      color: 'text-gray-900 dark:text-white'
    },
    {
      label: isProMode ? 'Sharpe Ratio' : 'Risk-Adjusted Return',
      value: sharpe_ratio ? sharpe_ratio.toFixed(2) : 'N/A',
      color: 'text-gray-900 dark:text-white'
    },
    {
      label: isProMode ? 'Max Drawdown' : 'Worst Decline',
      value: max_drawdown ? `${(max_drawdown * 100).toFixed(2)}%` : 'N/A',
      color: 'text-red-600 dark:text-red-400'
    },
    {
      label: isProMode ? 'Sortino Ratio' : 'Downside Protection',
      value: sortino_ratio ? sortino_ratio.toFixed(2) : 'N/A',
      color: 'text-gray-900 dark:text-white'
    },
  ];

  if (calmar_ratio) {
    metrics.push({
      label: isProMode ? 'Calmar Ratio' : 'Recovery Strength',
      value: calmar_ratio.toFixed(2),
      color: 'text-gray-900 dark:text-white'
    });
  }

  return (
    <div className="space-y-2">
      {metrics.map((metric, index) => (
        <div 
          key={metric.label}
          className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {metric.label}
          </div>
          <div className={`text-sm font-semibold ${metric.color}`}>
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}

