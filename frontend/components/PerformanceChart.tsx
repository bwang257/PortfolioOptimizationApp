'use client';

import { useState, useEffect } from 'react';
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
  const [visibleTickers, setVisibleTickers] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(false);

  // Initialize visible tickers to all tickers + portfolio
  useEffect(() => {
    const allTickers = new Set(Object.keys(priceHistory));
    if (portfolioReturns && portfolioReturns.length > 0) {
      allTickers.add('Portfolio');
    }
    setVisibleTickers(allTickers);
  }, [priceHistory, portfolioReturns]);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  const toggleTicker = (ticker: string) => {
    setVisibleTickers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticker)) {
        newSet.delete(ticker);
      } else {
        newSet.add(ticker);
      }
      return newSet;
    });
  };
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
  
  // Get all available tickers (including hidden ones)
  const allAvailableTickers = new Set(tickers);
  if (hasPortfolio) {
    allAvailableTickers.add('Portfolio');
  }
  const hiddenTickers = Array.from(allAvailableTickers).filter(t => !visibleTickers.has(t));
  
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Over Time
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <span>Click legend items to show/hide</span>
        </div>
      </div>
      {hiddenTickers.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hidden:</span>
          {hiddenTickers.map(ticker => (
            <button
              key={ticker}
              onClick={() => toggleTicker(ticker)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>{ticker === 'Portfolio' ? 'Optimized Portfolio' : ticker}</span>
              <span className="text-blue-600 dark:text-blue-400">+</span>
            </button>
          ))}
        </div>
      )}
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
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', offset: 5 , dy: 20}}
              domain={yAxisDomain}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => [
                `${parseFloat(value).toFixed(2)}%`, 
                name === 'Portfolio' ? 'Optimized Portfolio' : name
              ]}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
              separator=": "
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              iconType="line"
              onClick={(e: any) => {
                if (e.dataKey) {
                  toggleTicker(e.dataKey);
                }
              }}
              formatter={(value: string, entry: any) => {
                const isVisible = visibleTickers.has(entry.dataKey || value);
                return (
                  <span 
                    style={{ 
                      opacity: isVisible ? 1 : 0.3,
                      cursor: 'pointer',
                      textDecoration: isVisible ? 'none' : 'line-through',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    title={isVisible ? 'Click to hide' : 'Click to show'}
                  >
                    {value}
                  </span>
                );
              }}
            />
            {tickers.map((ticker, index) => {
              if (!visibleTickers.has(ticker)) return null;
              return (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  name={ticker}
                />
              );
            })}
            {hasPortfolio && visibleTickers.has('Portfolio') && (
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke={isDark ? '#f3f4f6' : '#1f2937'}
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

