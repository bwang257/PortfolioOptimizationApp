'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RollingMetricsData {
  date: string;
  value: number;
}

interface RollingMetricsChartProps {
  rollingMetrics: {
    sharpe_30?: RollingMetricsData[];
    sharpe_60?: RollingMetricsData[];
    sharpe_90?: RollingMetricsData[];
    volatility_30?: RollingMetricsData[];
    volatility_60?: RollingMetricsData[];
    volatility_90?: RollingMetricsData[];
  };
}

export default function RollingMetricsChart({ rollingMetrics }: RollingMetricsChartProps) {
  // Prepare data for Sharpe ratio chart
  const sharpeData: any[] = [];
  const allSharpeDates = new Set<string>();
  
  ['sharpe_30', 'sharpe_60', 'sharpe_90'].forEach(key => {
    const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
    if (data) {
      data.forEach(d => allSharpeDates.add(d.date));
    }
  });
  
  Array.from(allSharpeDates).sort().forEach(date => {
    const point: any = { date };
    ['sharpe_30', 'sharpe_60', 'sharpe_90'].forEach(key => {
      const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
      if (data) {
        const value = data.find(d => d.date === date);
        if (value) {
          point[key.replace('sharpe_', '') + 'd'] = parseFloat(value.value.toFixed(3));
        }
      }
    });
    sharpeData.push(point);
  });
  
  // Prepare data for volatility chart
  const volData: any[] = [];
  const allVolDates = new Set<string>();
  
  ['volatility_30', 'volatility_60', 'volatility_90'].forEach(key => {
    const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
    if (data) {
      data.forEach(d => allVolDates.add(d.date));
    }
  });
  
  Array.from(allVolDates).sort().forEach(date => {
    const point: any = { date };
    ['volatility_30', 'volatility_60', 'volatility_90'].forEach(key => {
      const data = rollingMetrics[key as keyof typeof rollingMetrics] as RollingMetricsData[] | undefined;
      if (data) {
        const value = data.find(d => d.date === date);
        if (value) {
          point[key.replace('volatility_', '') + 'd'] = (parseFloat(value.value.toFixed(4)) * 100).toFixed(2);
        }
      }
    });
    volData.push(point);
  });
  
  return (
    <div className="space-y-8">
      {/* Rolling Sharpe Ratio Chart */}
      <div className="w-full h-80">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Rolling Sharpe Ratio
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sharpeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'Sharpe Ratio', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => parseFloat(value).toFixed(3)}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {rollingMetrics.sharpe_30 && (
              <Line
                type="monotone"
                dataKey="30d"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="30-day"
              />
            )}
            {rollingMetrics.sharpe_60 && (
              <Line
                type="monotone"
                dataKey="60d"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="60-day"
              />
            )}
            {rollingMetrics.sharpe_90 && (
              <Line
                type="monotone"
                dataKey="90d"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                name="90-day"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Rolling Volatility Chart */}
      <div className="w-full h-80">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Rolling Volatility
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={volData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              label={{ value: 'Volatility (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            {rollingMetrics.volatility_30 && (
              <Line
                type="monotone"
                dataKey="30d"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
                name="30-day"
              />
            )}
            {rollingMetrics.volatility_60 && (
              <Line
                type="monotone"
                dataKey="60d"
                stroke="#F97316"
                strokeWidth={2}
                dot={false}
                name="60-day"
              />
            )}
            {rollingMetrics.volatility_90 && (
              <Line
                type="monotone"
                dataKey="90d"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                name="90-day"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

