'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineChartProps {
  portfolioReturns?: Array<{ date: string; value: number }>;
  onHover?: (value: number | null) => void;
}

export default function SparklineChart({ portfolioReturns, onHover }: SparklineChartProps) {
  const [isDark, setIsDark] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

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

  if (!portfolioReturns || portfolioReturns.length === 0) {
    return null;
  }

  // Format data for chart
  const chartData = portfolioReturns.map(point => ({
    date: point.date.split(' ')[0],
    value: point.value
  }));

  // Calculate percentage return from cumulative value
  const firstValue = chartData[0]?.value || 1;
  const percentageData = chartData.map(point => ({
    date: point.date,
    value: ((point.value / firstValue - 1) * 100),
    cumulativeValue: point.value
  }));

  const handleMouseMove = (activePayload: any) => {
    if (activePayload && activePayload.length > 0) {
      const payload = activePayload[0].payload;
      // Calculate annualized return from cumulative value
      // Assuming the data spans the backtest period, we'll use a simple conversion
      // For hover, show the cumulative return percentage
      const cumulativeReturn = ((payload.cumulativeValue / firstValue - 1) * 100);
      setHoveredValue(cumulativeReturn);
      if (onHover) {
        // Convert to approximate annualized (this is a simplification)
        // In a real implementation, you'd calculate based on actual time period
        onHover(cumulativeReturn);
      }
    } else {
      setHoveredValue(null);
      if (onHover) {
        onHover(null);
      }
    }
  };

  return (
    <div className="w-full" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={percentageData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          onMouseMove={(e) => {
            if (e && e.activePayload) {
              handleMouseMove(e.activePayload);
            }
          }}
          onMouseLeave={() => {
            setHoveredValue(null);
            if (onHover) {
              onHover(null);
            }
          }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={isDark ? "#10b981" : "#059669"}
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: isDark ? "#10b981" : "#059669" }}
          />
          <Tooltip
            cursor={{ stroke: isDark ? "#10b981" : "#059669", strokeWidth: 1, strokeDasharray: '3 3' }}
            contentStyle={{ 
              display: 'none' // Hide default tooltip, we'll use custom
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

