'use client';

import { useState, useEffect } from 'react';
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
  const [isDark, setIsDark] = useState(false);

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

  // Sort frontier points by risk for proper line rendering
  const sortedFrontier = [...efficientFrontier].sort((a, b) => a.risk - b.risk);
  
  // Filter out any invalid points
  const validFrontier = sortedFrontier.filter(point => 
    isFinite(point.risk) && isFinite(point.return) && point.risk >= 0
  );
  
  // Prepare data for the frontier line
  let frontierData = validFrontier.map(point => ({
    risk: point.risk * 100,
    return: point.return * 100,
  }));
  
  // Current portfolio point - validate and convert to percentage
  const currentPoint = {
    risk: isFinite(currentRisk) && !isNaN(currentRisk) ? currentRisk * 100 : 0,
    return: isFinite(currentReturn) && !isNaN(currentReturn) ? currentReturn * 100 : 0,
  };
  
  // Extend the frontier past the current risk so the curve continues visually
  // This ensures the line extends beyond the red dot even if backend doesn't provide enough points
  if (frontierData.length >= 2 && currentPoint.risk > 0 && currentPoint.return > 0) {
    const last = frontierData[frontierData.length - 1];
    const secondLast = frontierData[frontierData.length - 2];
    
    // Calculate slope from the last two points
    const slope = (last.risk - secondLast.risk) !== 0 
      ? (last.return - secondLast.return) / (last.risk - secondLast.risk)
      : 0;
    
    // If the current portfolio risk is beyond the last real frontier point:
    // mathematically project new points using the slope of the last segment
    if (currentPoint.risk > last.risk && slope !== 0 && isFinite(slope)) {
      // Add point at current portfolio risk
      const pointAtCurrent = {
        risk: currentPoint.risk,
        return: last.return + slope * (currentPoint.risk - last.risk),
      };
      
      // Add multiple points beyond current portfolio to ensure smooth extension
      // Extend by 40% beyond current portfolio for better visual continuation
      const extensionDistance = currentPoint.risk - last.risk;
      const extendedPoints = [];
      
      // Add point at current portfolio
      extendedPoints.push(pointAtCurrent);
      
      // Add points beyond current portfolio (20%, 40%, 60% extension)
      for (const extensionPercent of [0.2, 0.4, 0.6]) {
        const extendedRisk = currentPoint.risk + extensionDistance * extensionPercent;
        const extendedReturn = pointAtCurrent.return + slope * (extendedRisk - currentPoint.risk);
        
        if (isFinite(extendedRisk) && isFinite(extendedReturn) && extendedRisk > currentPoint.risk) {
          extendedPoints.push({
            risk: extendedRisk,
            return: extendedReturn,
          });
        }
      }
      
      // Add all extended points
      frontierData.push(...extendedPoints);
      
      // Re-sort by risk to maintain proper curve shape
      frontierData.sort((a, b) => a.risk - b.risk);
    }
    
    // Also ensure we have points up to the current portfolio if it's before the last point
    // but there's a gap (current portfolio is between existing points)
    if (currentPoint.risk < last.risk && currentPoint.risk > secondLast.risk && slope !== 0 && isFinite(slope)) {
      // Current portfolio is between secondLast and last - ensure we have a point there
      const pointAtCurrent = {
        risk: currentPoint.risk,
        return: secondLast.return + slope * (currentPoint.risk - secondLast.risk),
      };
      
      // Insert point at current portfolio position (maintain sorted order)
      const insertIndex = frontierData.findIndex(p => p.risk > currentPoint.risk);
      if (insertIndex > 0) {
        frontierData.splice(insertIndex, 0, pointAtCurrent);
      }
    }
  }
  
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
  // Otherwise, extend by 20% of the total range to show the curve continues
  let riskMaxDomain: number;
  if (hasPointsBeyond) {
    // Show all points beyond current plus 15% padding
    const distanceBeyond = maxRiskBeyondCurrent - currentPoint.risk;
    riskMaxDomain = maxRiskBeyondCurrent + (distanceBeyond * 0.15);
  } else {
    // No points beyond, but still extend a bit to show the curve continues
    // Extend by 20% of the total range
    riskMaxDomain = riskMax + ((riskMax - riskMin) * 0.2);
  }
  
  // Also extend the return domain to show more of the frontier
  const returnExtension = (returnMax - returnMin) * 0.15 || 1;
  
  const returnPadding = (returnMax - returnMin) * 0.05 || 1;
  
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
                <stop offset="5%" stopColor="#38915a" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#38915a" stopOpacity={0.05}/>
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
              label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft', offset: 5, dy: 40}}
              tick={{ fontSize: 11, fill: '#6b7280' }}
              domain={returnDomain}
              tickFormatter={(value) => Math.round(value).toString()}
            />
            <Tooltip 
              cursor={{ stroke: '#38915a', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ 
                backgroundColor: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
                border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              formatter={(value: any) => [`${parseFloat(value).toFixed(2)}%`, 'Expected Return']}
              labelFormatter={(label) => `Risk (Volatility): ${Math.round(parseFloat(label))}%`}
              separator=": "
            />
            <Area
              type="monotone"
              dataKey="return"
              stroke="#38915a"
              strokeWidth={3}
              fill="url(#frontierGradient)"
              name="Efficient Frontier"
            />
            <ReferenceDot
              x={currentPoint.risk}
              y={currentPoint.return}
              r={6}
              fill="#627d98"
              stroke="#486581"
              strokeWidth={2}
              isFront={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-primary-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Efficient Frontier</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-navy-500 border-2 border-navy-600"></div>
          <span className="text-gray-600 dark:text-gray-400">Current Portfolio</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
        The efficient frontier shows the set of optimal portfolios that offer the highest expected return for a given level of risk. Your current portfolio is marked with a red dot.
      </p>
    </div>
  );
}

