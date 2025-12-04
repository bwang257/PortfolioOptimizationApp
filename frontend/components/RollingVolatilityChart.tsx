'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RollingMetricsData {
  date: string;
  value: number;
}

interface RollingVolatilityChartProps {
  rollingMetrics: {
    volatility_30?: RollingMetricsData[];
    volatility_60?: RollingMetricsData[];
    volatility_90?: RollingMetricsData[];
  };
}

export default function RollingVolatilityChart({ rollingMetrics }: RollingVolatilityChartProps) {
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
  
  // Prepare data for volatility chart
  const volData: any[] = [];
  const allVolDates = new Set<string>();
  const allVolValues: number[] = [];
  
  ['volatility_30', 'volatility_60', 'volatility_90'].forEach(key => {
    const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
    if (data) {
      data.forEach(d => {
        allVolDates.add(d.date);
        const volPercent = parseFloat((d.value * 100).toFixed(2));
        allVolValues.push(volPercent);
      });
    }
  });
  
  Array.from(allVolDates).sort().forEach(date => {
    const point: any = { date: formatDate(date) };
    ['volatility_30', 'volatility_60', 'volatility_90'].forEach(key => {
      const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
      if (data) {
        const value = data.find(d => d.date === date);
        if (value) {
          const volPercent = parseFloat((value.value * 100).toFixed(2));
          point[key.replace('volatility_', '') + 'd'] = volPercent;
        }
      }
    });
    volData.push(point);
  });

  // Calculate Y-axis domain with padding
  const volMin = allVolValues.length > 0 ? Math.min(...allVolValues) : 0;
  const volMax = allVolValues.length > 0 ? Math.max(...allVolValues) : 100;
  const volRange = volMax - volMin;
  const volPadding = volRange > 0 ? volRange * 0.1 : 5;
  const volDomain = [Math.max(0, volMin - volPadding), volMax + volPadding];
  
  return (
    <div className="w-full" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={volData} margin={{ top: 10, right: 30, left: 60, bottom: 60 }}>
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
            label={{ value: 'Volatility (%)', angle: -90, position: 'insideLeft', offset: 5, dy: 30 }}
            domain={volDomain}
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
            separator=": "
            formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
            labelFormatter={(label) => `Date: ${formatDate(label)}`}
          />
          {rollingMetrics.volatility_30 && (
            <Line
              type="monotone"
              dataKey="30d"
              stroke={isDark ? "#8fcea5" : "#10b981"}
              strokeWidth={2.5}
              dot={false}
              name="30-day"
            />
          )}
          {rollingMetrics.volatility_60 && (
            <Line
              type="monotone"
              dataKey="60d"
              stroke={isDark ? "#bce4ca" : "#059669"}
              strokeWidth={2.5}
              dot={false}
              name="60-day"
            />
          )}
          {rollingMetrics.volatility_90 && (
            <Line
              type="monotone"
              dataKey="90d"
              stroke={isDark ? "#5cb078" : "#047857"}
              strokeWidth={2.5}
              dot={false}
              name="90-day"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

