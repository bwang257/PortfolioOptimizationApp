'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface CompactPerformanceChartProps {
  portfolioReturns?: Array<{ date: string; value: number }>;
  benchmarkReturns?: Array<{ date: string; value: number }>;
  totalReturn?: number;
  currentValue?: number;
}

export default function CompactPerformanceChart({ 
  portfolioReturns, 
  benchmarkReturns,
  totalReturn,
  currentValue 
}: CompactPerformanceChartProps) {
  const [isDark, setIsDark] = useState(false);
  const { isProMode } = useUserPreferences();

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

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return dateStr.split(' ')[0];
  };
  
  const chartData: any[] = [];
  const allDates = new Set<string>();
  
  if (portfolioReturns) {
    portfolioReturns.forEach(p => allDates.add(p.date));
  }
  if (benchmarkReturns) {
    benchmarkReturns.forEach(p => allDates.add(p.date));
  }
  
  const sortedDates = Array.from(allDates).sort();
  
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

  // Calculate total return and current value if not provided
  const calculatedTotalReturn = totalReturn !== undefined 
    ? totalReturn 
    : portfolioReturns && portfolioReturns.length > 0
    ? ((portfolioReturns[portfolioReturns.length - 1].value / portfolioReturns[0].value - 1) * 100)
    : 0;
  
  const calculatedCurrentValue = currentValue !== undefined
    ? currentValue
    : portfolioReturns && portfolioReturns.length > 0
    ? portfolioReturns[portfolioReturns.length - 1].value
    : 1;

  return (
    <div className="w-full relative" style={{ height: '256px' }}>
      {/* Overlay Stats */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Return</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {calculatedTotalReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">Current Value</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            ${calculatedCurrentValue.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">You</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 border border-gray-400 dark:border-gray-500 border-dashed"></div>
          <span className="text-xs text-gray-700 dark:text-gray-300">Market</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        {isProMode ? (
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 40, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={40}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: '10px' } }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              formatter={(value: any, name: string) => {
                const label = name === 'Portfolio' ? 'You' : name === 'Benchmark' ? 'Market' : name;
                return [`${parseFloat(value).toFixed(2)}%`, label];
              }}
              labelFormatter={(label) => formatDate(label)}
              separator=": "
            />
            {portfolioReturns && (
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke={isDark ? "#10b981" : "#059669"}
                strokeWidth={2}
                dot={false}
                name="Portfolio"
              />
            )}
            {benchmarkReturns && (
              <Line
                type="monotone"
                dataKey="Benchmark"
                stroke={isDark ? "#6b7280" : "#4b5563"}
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeOpacity={0.8}
                dot={false}
                name="Benchmark"
              />
            )}
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 40, bottom: 40 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={40}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: '10px' } }}
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              formatter={(value: any, name: string) => {
                const label = name === 'Portfolio' ? 'You' : name === 'Benchmark' ? 'Market' : name;
                return [`${parseFloat(value).toFixed(2)}%`, label];
              }}
              labelFormatter={(label) => formatDate(label)}
              separator=": "
            />
            {portfolioReturns && (
              <Area
                type="monotone"
                dataKey="Portfolio"
                stroke={isDark ? "#10b981" : "#059669"}
                strokeWidth={2}
                fill="url(#portfolioGradient)"
                name="Portfolio"
              />
            )}
            {benchmarkReturns && (
              <Area
                type="monotone"
                dataKey="Benchmark"
                stroke={isDark ? "#6b7280" : "#4b5563"}
                strokeWidth={2}
                strokeDasharray="5 5"
                strokeOpacity={0.8}
                fill="none"
                name="Benchmark"
              />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

