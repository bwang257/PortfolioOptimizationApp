'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface PortfolioCompositionChartProps {
  weights: Record<string, number>;
}

const COLORS = [
  '#38915a', // primary green
  '#627d98', // navy
  '#8fcea5', // light green
  '#486581', // dark navy
  '#5cb078', // medium green
  '#334e68', // darker navy
  '#bce4ca', // very light green
  '#243b53', // darkest navy
  '#2a7447', // darker green
  '#102a43', // very dark navy
];

export default function PortfolioCompositionChart({ weights }: PortfolioCompositionChartProps) {
  const [isDark, setIsDark] = useState(false);
  const { isProMode } = useUserPreferences();

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

  const data = Object.entries(weights)
    .map(([ticker, weight]) => ({
      name: ticker,
      value: Math.abs(weight * 100), // Convert to percentage and use absolute value
      sign: weight >= 0 ? (isProMode ? 'Long' : 'Buy') : (isProMode ? 'Short' : 'Bet Against'),
    }))
    .filter(item => item.value > 0.01) // Filter out very small weights
    .sort((a, b) => b.value - a.value);
  
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value.toFixed(1)}%`;
  };
  
  return (
    <div className="w-full overflow-hidden">
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
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              itemStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
              labelStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Weight']}
              labelFormatter={(label, payload) => {
                const entry = payload[0]?.payload;
                return `${entry?.name} (${entry?.sign})`;
              }}
              separator=": "
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

