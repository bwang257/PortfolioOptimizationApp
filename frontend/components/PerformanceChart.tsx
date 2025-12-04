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
  benchmarkReturns?: Array<{ date: string; value: number }>;
}

export default function PerformanceChart({ priceHistory, portfolioReturns, benchmarkReturns }: PerformanceChartProps) {
  const [visibleTickers, setVisibleTickers] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(false);

  // Initialize visible tickers to only Portfolio and Benchmark (hide individual assets by default)
  useEffect(() => {
    const visible = new Set<string>();
    if (portfolioReturns && portfolioReturns.length > 0) {
      visible.add('Portfolio');
    }
    if (benchmarkReturns && benchmarkReturns.length > 0) {
      visible.add('Benchmark');
    }
    setVisibleTickers(visible);
  }, [portfolioReturns, benchmarkReturns]);

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
  if (portfolioReturns) {
    portfolioReturns.forEach(p => allDates.add(p.date));
  }
  if (benchmarkReturns) {
    benchmarkReturns.forEach(p => allDates.add(p.date));
  }
  
  const sortedDates = Array.from(allDates).sort();
  
  // Build chart data
  sortedDates.forEach(date => {
    const dataPoint: any = { date: formatDate(date) };
    
    // Add portfolio returns
    if (portfolioReturns) {
      const portfolioPoint = portfolioReturns.find(p => p.date === date);
      if (portfolioPoint) {
        const firstValue = portfolioReturns[0]?.value || 1;
        dataPoint['Portfolio'] = parseFloat(((portfolioPoint.value / firstValue - 1) * 100).toFixed(2));
      }
    }
    
    // Add benchmark returns
    if (benchmarkReturns) {
      const benchmarkPoint = benchmarkReturns.find(p => p.date === date);
      if (benchmarkPoint) {
        const firstValue = benchmarkReturns[0]?.value || 1;
        dataPoint['Benchmark'] = parseFloat(((benchmarkPoint.value / firstValue - 1) * 100).toFixed(2));
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
    '#38915a', // primary green
    '#627d98', // navy
    '#8fcea5', // light green
    '#486581', // dark navy
    '#5cb078', // medium green
    '#334e68', // darker navy
    '#bce4ca', // very light green
    '#243b53', // darkest navy
  ];
  
  const hasPortfolio = portfolioReturns && portfolioReturns.length > 0;
  const hasBenchmark = benchmarkReturns && benchmarkReturns.length > 0;
  
  // Get all available series (Portfolio and Benchmark only - individual assets are hidden by default)
  const allAvailableSeries = new Set<string>();
  if (hasPortfolio) {
    allAvailableSeries.add('Portfolio');
  }
  if (hasBenchmark) {
    allAvailableSeries.add('Benchmark');
  }
  const hiddenSeries = Array.from(allAvailableSeries).filter(t => !visibleTickers.has(t));
  
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Performance Over Time
        </h3>
      </div>
      {hiddenSeries.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-card-sm">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</span>
          {hiddenSeries.map(series => (
            <button
              key={series}
              onClick={() => toggleTicker(series)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>{series === 'Portfolio' ? 'Optimized Portfolio' : series === 'Benchmark' ? 'S&P 500 (SPY)' : series}</span>
              <span className="text-primary-600 dark:text-primary-400">+</span>
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
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              formatter={(value: any, name: string) => [
                `${parseFloat(value).toFixed(2)}%`, 
                name === 'Portfolio' ? 'Optimized Portfolio' : name === 'Benchmark' ? 'S&P 500 (SPY)' : name
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
            {hasPortfolio && visibleTickers.has('Portfolio') && (
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke="#38915a"
                strokeWidth={3}
                dot={false}
                name="Optimized Portfolio"
              />
            )}
            {hasBenchmark && visibleTickers.has('Benchmark') && (
              <Line
                type="monotone"
                dataKey="Benchmark"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="S&P 500 (SPY)"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

