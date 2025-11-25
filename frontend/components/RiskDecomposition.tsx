'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RiskDecompositionProps {
  riskDecomposition: Record<string, number>;
}

export default function RiskDecomposition({ riskDecomposition }: RiskDecompositionProps) {
  const data = Object.entries(riskDecomposition)
    .map(([ticker, contribution]) => ({
      ticker,
      contribution: Math.abs(contribution), // Use absolute value for visualization
      sign: contribution >= 0 ? 'Positive' : 'Negative',
    }))
    .sort((a, b) => b.contribution - a.contribution);
  
  return (
    <div className="w-full h-96">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Risk Decomposition
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="ticker" 
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Risk Contribution (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: any) => `${parseFloat(value).toFixed(2)}%`}
            labelFormatter={(label) => `Ticker: ${label}`}
          />
          <Legend />
          <Bar 
            dataKey="contribution" 
            fill="#3B82F6"
            name="Risk Contribution"
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Shows how much each asset contributes to the overall portfolio risk. Higher values indicate greater risk contribution.
      </p>
    </div>
  );
}

