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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {metrics.map((metric) => (
        <div key={metric.label} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{metric.label}</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{metric.value}</p>
        </div>
      ))}
    </div>
  );
}