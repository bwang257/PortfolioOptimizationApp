'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PriceDataPoint {
  date: string;
  price: number;
}

interface PerformanceChartProps {
  priceHistory: Record<string, PriceDataPoint[]>;
  portfolioReturns?: Array<{ date: string; value: number }>;
}

export default function PerformanceChart({ priceHistory, portfolioReturns }: PerformanceChartProps) {
  // Helper function to format date (remove time component)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Handle both "2024-01-01 00:00:00" and "2024-01-01" formats
    return dateStr.split(' ')[0];
  };
  
  // Prepare data for chart
  const chartData: any[] = [];
  
  // Get all unique dates
  const allDates = new Set<string>();
  Object.values(priceHistory).forEach(prices => {
    prices.forEach(p => allDates.add(p.date));
  });
  if (portfolioReturns) {
    portfolioReturns.forEach(p => allDates.add(p.date));
  }
  
  const sortedDates = Array.from(allDates).sort();
  
  // Build chart data
  sortedDates.forEach(date => {
    const dataPoint: any = { date: formatDate(date) };
    
    // Add price data for each ticker
    Object.entries(priceHistory).forEach(([ticker, prices]) => {
      const pricePoint = prices.find(p => p.date === date);
      if (pricePoint) {
        // Normalize to percentage change from first value
        const firstPrice = prices[0]?.price || 1;
        dataPoint[ticker] = parseFloat(((pricePoint.price / firstPrice - 1) * 100).toFixed(2));
      }
    });
    
    // Add portfolio returns
    if (portfolioReturns) {
      const portfolioPoint = portfolioReturns.find(p => p.date === date);
      if (portfolioPoint) {
        const firstValue = portfolioReturns[0]?.value || 1;
        dataPoint['Portfolio'] = parseFloat(((portfolioPoint.value / firstValue - 1) * 100).toFixed(2));
      }
    }
    
    chartData.push(dataPoint);
  });
  
  // Calculate dynamic Y-axis domain with padding
  const allValues: number[] = [];
  chartData.forEach(point => {
    Object.keys(point).forEach(key => {
      if (key !== 'date' && typeof point[key] === 'number') {
        allValues.push(point[key]);
      }
    });
  });
  
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = Math.max(Math.abs(maxValue - minValue) * 0.1, 5); // 10% padding or at least 5%
  const yAxisDomain = [minValue - padding, maxValue + padding];
  
  const colors = [
    '#3B82F6', // blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#F97316', // orange
  ];
  
  const tickers = Object.keys(priceHistory);
  const hasPortfolio = portfolioReturns && portfolioReturns.length > 0;
  
  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Performance Over Time
      </h3>
      <div className="w-full" style={{ height: '400px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', offset: -10 }}
              domain={yAxisDomain}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
              formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
            />
            {tickers.map((ticker, index) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                name={ticker}
              />
            ))}
            {hasPortfolio && (
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke="#f5f5f5"
                strokeWidth={3}
                dot={false}
                name="Optimized Portfolio"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

