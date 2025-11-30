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
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Risk Decomposition
      </h3>
      <div className="w-full" style={{ height: '400px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 30, left: 70, bottom: 60 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              dataKey="ticker" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11, fill: '#6b7280' }}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: 'Risk Contribution (%)', angle: -90, position: 'insideLeft', offset: 5 , dy: 60}}
            />
            <Tooltip 
              cursor={false}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Risk Contribution']}
              labelFormatter={(label) => `Ticker: ${label}`}
              separator=": "
            />
            <Legend />
            <Bar 
              dataKey="contribution" 
              fill="#3B82F6"
              name="Risk Contribution"
              radius={[4, 4, 0, 0] as [number, number, number, number]}
              activeBar={{ 
                fill: '#2563EB', 
                stroke: '#1E40AF', 
                strokeWidth: 2
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
        Shows how much each asset contributes to the overall portfolio risk. Higher values indicate greater risk contribution.
      </p>
    </div>
  );
}

