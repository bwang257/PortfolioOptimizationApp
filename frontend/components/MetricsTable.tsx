'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeightsChartProps {
  weights: Record<string, number>;
}

export default function WeightsChart({ weights }: WeightsChartProps) {
  const data = Object.entries(weights)
    .map(([ticker, weight]) => ({
      ticker,
      weight: weight * 100, // Convert to percentage
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Optimal Portfolio Weights
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ticker" />
          <YAxis label={{ value: 'Weight (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
          <Legend />
          <Bar dataKey="weight" fill="#3b82f6" name="Weight (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}