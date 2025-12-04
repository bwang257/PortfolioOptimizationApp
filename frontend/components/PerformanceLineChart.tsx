'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceLineChartProps {
  portfolioReturns?: Array<{ date: string; value: number }>;
  benchmarkReturns?: Array<{ date: string; value: number }>;
}

export default function PerformanceLineChart({ portfolioReturns, benchmarkReturns }: PerformanceLineChartProps) {
  const [isDark, setIsDark] = useState(false);

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

  // Helper function to format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return dateStr.split(' ')[0];
  };
  
  // Prepare data for chart
  const chartData: any[] = [];
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
    
    if (portfolioReturns) {
      const portfolioPoint = portfolioReturns.find(p => p.date === date);
      if (portfolioPoint) {
        const firstValue = portfolioReturns[0]?.value || 1;
        dataPoint['Portfolio'] = parseFloat(((portfolioPoint.value / firstValue - 1) * 100).toFixed(2));
      }
    }
    
    if (benchmarkReturns) {
      const benchmarkPoint = benchmarkReturns.find(p => p.date === date);
      if (benchmarkPoint) {
        const firstValue = benchmarkReturns[0]?.value || 1;
        dataPoint['Benchmark'] = parseFloat(((benchmarkPoint.value / firstValue - 1) * 100).toFixed(2));
      }
    }
    
    chartData.push(dataPoint);
  });

  return (
    <div className="w-full relative" style={{ height: '400px' }}>
      {/* Custom Legend in Top Right */}
      <div className="absolute top-2 right-2 z-10 flex gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-medium text-slate-700 dark:text-gray-300">You</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-200 dark:border-gray-700">
          <div className="w-3 h-3 border-2 border-slate-400 dark:border-gray-500 border-dashed"></div>
          <span className="text-xs font-medium text-slate-700 dark:text-gray-300">Market</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
            label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', offset: 5, dy: 30 }}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
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
            formatter={(value: any, name: string) => {
              const label = name === 'Portfolio' ? 'You' : name === 'Benchmark' ? 'Market' : name;
              return [`${parseFloat(value).toFixed(2)}%`, label];
            }}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
            separator=": "
          />
          {portfolioReturns && (
            <Line
              type="monotone"
              dataKey="Portfolio"
              stroke={isDark ? "#10b981" : "#059669"}
              strokeWidth={3}
              dot={false}
              name="Optimized Portfolio"
            />
          )}
          {benchmarkReturns && (
            <Line
              type="monotone"
              dataKey="Benchmark"
              stroke={isDark ? "#6b7280" : "#4b5563"}
              strokeWidth={3}
              strokeDasharray="5 5"
              strokeOpacity={0.8}
              dot={false}
              name="S&P 500 (SPY)"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

