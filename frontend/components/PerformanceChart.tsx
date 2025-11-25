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
    const dataPoint: any = { date };
    
    // Add price data for each ticker
    Object.entries(priceHistory).forEach(([ticker, prices]) => {
      const pricePoint = prices.find(p => p.date === date);
      if (pricePoint) {
        // Normalize to percentage change from first value
        const firstPrice = prices[0]?.price || 1;
        dataPoint[ticker] = ((pricePoint.price / firstPrice - 1) * 100).toFixed(2);
      }
    });
    
    // Add portfolio returns
    if (portfolioReturns) {
      const portfolioPoint = portfolioReturns.find(p => p.date === date);
      if (portfolioPoint) {
        const firstValue = portfolioReturns[0]?.value || 1;
        dataPoint['Portfolio'] = ((portfolioPoint.value / firstValue - 1) * 100).toFixed(2);
      }
    }
    
    chartData.push(dataPoint);
  });
  
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
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Performance Over Time
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
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
              stroke="#1F2937"
              strokeWidth={3}
              dot={false}
              name="Optimized Portfolio"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

