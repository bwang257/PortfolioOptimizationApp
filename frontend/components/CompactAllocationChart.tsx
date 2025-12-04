'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface CompactAllocationChartProps {
  weights: Record<string, number>;
}

const COLORS = [
  '#10b981', '#059669', '#047857', '#8fcea5', '#5cb078', 
  '#38915a', '#2a7447', '#bce4ca', '#627d98', '#486581'
];

export default function CompactAllocationChart({ weights }: CompactAllocationChartProps) {
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

  const data = Object.entries(weights)
    .map(([ticker, weight]) => ({
      name: ticker,
      value: Math.abs(weight * 100),
      sign: weight >= 0 ? (isProMode ? 'Long' : 'Buy') : (isProMode ? 'Short' : 'Bet Against'),
    }))
    .filter(item => item.value > 0.01)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full" style={{ height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
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
              borderRadius: '6px',
              padding: '8px',
              fontSize: '11px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: isDark ? '#f3f4f6' : '#111827'
            }}
            itemStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontSize: '11px' }}
            labelStyle={{ color: isDark ? '#f3f4f6' : '#111827', fontSize: '11px' }}
            formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Weight']}
            labelFormatter={(label, payload) => {
              const entry = payload[0]?.payload;
              return `${entry?.name} (${entry?.sign})`;
            }}
            separator=": "
          />
        </PieChart>
      </ResponsiveContainer>
      <Legend 
        wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
        iconType="circle"
        formatter={(value, entry: any) => {
          const dataEntry = entry.payload;
          return `${dataEntry.name}: ${dataEntry.value.toFixed(1)}%`;
        }}
      />
    </div>
  );
}

