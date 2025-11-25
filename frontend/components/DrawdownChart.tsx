'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DrawdownChartProps {
  portfolioReturns: Array<{ date: string; value: number }>;
}

export default function DrawdownChart({ portfolioReturns }: DrawdownChartProps) {
  // Calculate drawdown
  const chartData = portfolioReturns.map((point, index) => {
    const currentValue = point.value;
    const peakValue = Math.max(...portfolioReturns.slice(0, index + 1).map(p => p.value));
    const drawdown = ((currentValue - peakValue) / peakValue) * 100;
    
    return {
      date: point.date,
      drawdown: drawdown.toFixed(2),
    };
  });
  
  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Drawdown Analysis
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
            label={{ value: 'Drawdown (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
          />
          <Area
            type="monotone"
            dataKey="drawdown"
            stroke="#EF4444"
            fillOpacity={1}
            fill="url(#colorDrawdown)"
            name="Drawdown"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Drawdown shows the peak-to-trough decline in portfolio value over time
      </p>
    </div>
  );
}

