'use client';

import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrawdownChartProps {
  portfolioReturns: Array<{ date: string; value: number }>;
}

export default function DrawdownChart({ portfolioReturns }: DrawdownChartProps) {
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
  // Helper function to format date (remove time component)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Handle both "2024-01-01 00:00:00" and "2024-01-01" formats
    return dateStr.split(' ')[0];
  };
  
  // Calculate drawdown
  const chartData = portfolioReturns.map((point, index) => {
    const currentValue = point.value;
    const peakValue = Math.max(...portfolioReturns.slice(0, index + 1).map(p => p.value));
    const drawdown = ((currentValue - peakValue) / peakValue) * 100;
    
    return {
      date: formatDate(point.date),
      drawdown: parseFloat(drawdown.toFixed(2)),
    };
  });
  
  // Calculate Y-axis domain to prevent spikes below axis
  const drawdownValues = chartData.map(d => d.drawdown);
  const minDrawdown = Math.min(...drawdownValues);
  const maxDrawdown = 0;

  // Add padding below minimum (10% or at least 2%)
  const padding = Math.max(Math.abs(minDrawdown) * 0.1, 2);
  const yAxisDomain = [minDrawdown - padding, maxDrawdown];
  
  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Drawdown Analysis
      </h3>
      <div className="w-full" style={{ height: '400px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
            <defs>
              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
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
              label={{ value: 'Drawdown (%)', angle: -90, position: 'insideLeft', offset: 5 , dy: 30}}
              domain={yAxisDomain}
              tickFormatter={(value) => parseFloat(value).toFixed(1)}
            />
            <Tooltip 
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Drawdown']}
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              separator=": "
            />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#EF4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDrawdown)"
              name="Drawdown"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
        Drawdown shows the peak-to-trough decline in portfolio value over time
      </p>
    </div>
  );
}

