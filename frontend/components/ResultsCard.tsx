interface MetricsTableProps {
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
    total_leverage,
  }: MetricsTableProps) {
    const formatPercent = (value: number | null) => {
      if (value === null) return 'N/A';
      return `${(value * 100).toFixed(2)}%`;
    };
  
    const formatRatio = (value: number | null) => {
      if (value === null) return 'N/A';
      return value.toFixed(3);
    };
  
    const metrics = [
      { label: 'Expected Return (Annualized)', value: formatPercent(expected_return) },
      { label: 'Volatility (Annualized)', value: formatPercent(volatility) },
      { label: 'Sharpe Ratio', value: formatRatio(sharpe_ratio) },
      { label: 'Sortino Ratio', value: formatRatio(sortino_ratio) },
      { label: 'Calmar Ratio', value: formatRatio(calmar_ratio) },
      { label: 'Maximum Drawdown', value: formatPercent(max_drawdown) },
    ];
  
    if (total_leverage !== null) {
      metrics.push({ label: 'Total Leverage', value: formatRatio(total_leverage) });
    }
  
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Metric
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {metrics.map((metric, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {metric.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {metric.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }