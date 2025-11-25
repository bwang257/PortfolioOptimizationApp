'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot, Area, AreaChart } from 'recharts';

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
  
  // Filter out any invalid points
  const validFrontier = sortedFrontier.filter(point => 
    isFinite(point.risk) && isFinite(point.return) && point.risk >= 0
  );
  
  // Prepare data for the frontier line
  const frontierData = validFrontier.map(point => ({
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
      <div className="w-full" style={{ minHeight: '400px' }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Efficient Frontier
        </h3>
        <div className="flex items-center justify-center" style={{ height: '350px' }}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Unable to calculate efficient frontier. Please try with different assets or constraints.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Efficient Frontier
      </h3>
      <div className="w-full" style={{ height: '400px', minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={frontierData} 
            margin={{ top: 10, right: 30, bottom: 60, left: 60 }}
          >
            <defs>
              <linearGradient id="frontierGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis 
              type="number"
              dataKey="risk"
              name="Risk"
              unit="%"
              label={{ value: 'Risk (Volatility %)', position: 'insideBottom', offset: -10 }}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis 
              type="number"
              dataKey="return"
              name="Return"
              unit="%"
              label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', offset: -10 }}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={['dataMin', 'dataMax']}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip 
              cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Return']}
              labelFormatter={(label) => `Risk: ${parseFloat(label).toFixed(2)}%`}
            />
            <Area
              type="monotone"
              dataKey="return"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#frontierGradient)"
              name="Efficient Frontier"
            />
            <ReferenceDot
              x={currentPoint.risk}
              y={currentPoint.return}
              r={6}
              fill="#EF4444"
              stroke="#DC2626"
              strokeWidth={2}
              isFront={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Efficient Frontier</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-red-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Current Portfolio</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
        The efficient frontier shows the set of optimal portfolios that offer the highest expected return for a given level of risk. Your current portfolio is marked with a red dot.
      </p>
    </div>
  );
}

