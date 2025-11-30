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
  
  // Current portfolio point - validate and convert to percentage
  const currentPoint = {
    risk: isFinite(currentRisk) && !isNaN(currentRisk) ? currentRisk * 100 : 0,
    return: isFinite(currentReturn) && !isNaN(currentReturn) ? currentReturn * 100 : 0,
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
  
  // Calculate domain to include both frontier and current portfolio point
  // Extend beyond current point to show more of the frontier curve
  const riskValues = frontierData.map(p => p.risk);
  const returnValues = frontierData.map(p => p.return);
  
  const riskMin = Math.min(...riskValues);
  const riskMax = Math.max(...riskValues);
  const returnMin = Math.min(...returnValues);
  const returnMax = Math.max(...returnValues);
  
  // Ensure we show points beyond the current portfolio point
  // Calculate how much of the frontier is beyond the current point
  const pointsBeyondCurrent = riskValues.filter(r => r > currentPoint.risk);
  const hasPointsBeyond = pointsBeyondCurrent.length > 0;
  const maxRiskBeyondCurrent = hasPointsBeyond 
    ? Math.max(...pointsBeyondCurrent) 
    : riskMax;
  
  // Add padding: 5% on left
  const riskPadding = (riskMax - riskMin) * 0.05 || 1;
  
  // Extend domain to show more of the frontier beyond current point
  // If there are points beyond current, extend to show them plus some padding
  // Otherwise, extend by 15% of the total range
  let riskMaxDomain: number;
  if (hasPointsBeyond) {
    // Show all points beyond current plus 10% padding
    const distanceBeyond = maxRiskBeyondCurrent - currentPoint.risk;
    riskMaxDomain = maxRiskBeyondCurrent + (distanceBeyond * 0.1);
  } else {
    // No points beyond, but still extend a bit to show the curve continues
    riskMaxDomain = riskMax + ((riskMax - riskMin) * 0.15);
  }
  
  const returnPadding = (returnMax - returnMin) * 0.05 || 1;
  const returnExtension = (returnMax - returnMin) * 0.1 || 1;
  
  const riskDomain = [Math.max(0, riskMin - riskPadding), riskMaxDomain];
  const returnDomain = [returnMin - returnPadding, returnMax + returnExtension];
  
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
              domain={riskDomain}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <YAxis 
              type="number"
              dataKey="return"
              name="Return"
              unit="%"
              label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', offset: -10 }}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={returnDomain}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip 
              cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Expected Return']}
              labelFormatter={(label) => `Risk (Volatility): ${Math.round(parseFloat(label))}%`}
              separator=": "
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

