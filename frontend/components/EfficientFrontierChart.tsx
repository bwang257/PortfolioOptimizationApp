'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';

interface EfficientFrontierPoint {
  risk: number;
  return: number;
}

interface EfficientFrontierChartProps {
  efficientFrontier: EfficientFrontierPoint[];
  currentRisk: number;
  currentReturn: number;
}

export default function EfficientFrontierChart({ 
  efficientFrontier, 
  currentRisk, 
  currentReturn 
}: EfficientFrontierChartProps) {
  // Sort frontier points by risk for proper line rendering
  const sortedFrontier = [...efficientFrontier].sort((a, b) => a.risk - b.risk);
  
  // Prepare data for the frontier line
  const frontierData = sortedFrontier.map(point => ({
    risk: point.risk * 100,
    return: point.return * 100,
  }));
  
  // Current portfolio point
  const currentPoint = {
    risk: currentRisk * 100,
    return: currentReturn * 100,
  };
  
  if (frontierData.length === 0) {
    return (
      <div className="w-full h-96">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Efficient Frontier
        </h3>
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          Unable to calculate efficient frontier. Please try with different assets or constraints.
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Efficient Frontier
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={frontierData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            dataKey="risk"
            name="Risk"
            unit="%"
            label={{ value: 'Risk (Volatility %)', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number"
            dataKey="return"
            name="Return"
            unit="%"
            label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
            labelFormatter={(label) => `Risk: ${label}%`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="return"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="Efficient Frontier"
            connectNulls={false}
          />
          <ReferenceDot
            x={currentPoint.risk}
            y={currentPoint.return}
            r={8}
            fill="#EF4444"
            stroke="#EF4444"
            strokeWidth={2}
            label={{ value: 'Current Portfolio', position: 'top' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Efficient Frontier</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Current Portfolio</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        The efficient frontier shows the set of optimal portfolios that offer the highest expected return for a given level of risk. Your current portfolio is marked with a red star.
      </p>
    </div>
  );
}

