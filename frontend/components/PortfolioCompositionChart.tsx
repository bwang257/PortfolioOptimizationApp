'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PortfolioCompositionChartProps {
  weights: Record<string, number>;
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
];

export default function PortfolioCompositionChart({ weights }: PortfolioCompositionChartProps) {
  const data = Object.entries(weights)
    .map(([ticker, weight]) => ({
      name: ticker,
      value: Math.abs(weight * 100), // Convert to percentage and use absolute value
      sign: weight >= 0 ? 'Long' : 'Short',
    }))
    .filter(item => item.value > 0.01) // Filter out very small weights
    .sort((a, b) => b.value - a.value);
  
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value.toFixed(1)}%`;
  };
  
  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Portfolio Composition
      </h3>
      <div className="w-full" style={{ height: '400px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
              formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
              labelFormatter={(label, payload) => {
                const entry = payload[0]?.payload;
                return `${entry?.name} (${entry?.sign})`;
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value, entry: any) => {
                const dataEntry = entry.payload;
                return `${dataEntry.name}: ${dataEntry.value.toFixed(1)}% (${dataEntry.sign})`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

