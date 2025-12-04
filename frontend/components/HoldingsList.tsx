'use client';

import { useState, useEffect } from 'react';
import { searchTickers, TickerInfo } from '@/lib/api';

interface HoldingsListProps {
  weights: Record<string, number>;
}

interface Holding {
  ticker: string;
  name: string;
  weight: number;
}

export default function HoldingsList({ weights }: HoldingsListProps) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExcluded, setShowExcluded] = useState(false);

  useEffect(() => {
    const fetchCompanyNames = async () => {
      const tickers = Object.keys(weights);
      const holdingsData: Holding[] = [];

      // Fetch company names for each ticker
      for (const ticker of tickers) {
        try {
          const results = await searchTickers(ticker);
          const match = results.find(r => r.symbol.toUpperCase() === ticker.toUpperCase());
          holdingsData.push({
            ticker: ticker.toUpperCase(),
            name: match?.name || ticker,
            weight: weights[ticker]
          });
        } catch (error) {
          // Fallback to ticker symbol if search fails
          holdingsData.push({
            ticker: ticker.toUpperCase(),
            name: ticker,
            weight: weights[ticker]
          });
        }
      }

      // Sort by weight (highest to lowest)
      holdingsData.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
      setHoldings(holdingsData);
      setLoading(false);
    };

    fetchCompanyNames();
  }, [weights]);

  // Filter holdings: active (weight > 0.01%) and excluded (weight <= 0.01%)
  const activeHoldings = holdings.filter(h => Math.abs(h.weight) > 0.0001);
  const excludedHoldings = holdings.filter(h => Math.abs(h.weight) <= 0.0001);
  const rejectedCount = excludedHoldings.length;

  // Determine which holdings to display
  const displayedHoldings = showExcluded ? holdings : activeHoldings;

  // Color palette for allocation bars
  const getBarColor = (index: number) => {
    const colors = [
      '#10b981', // emerald-500
      '#059669', // emerald-600
      '#047857', // emerald-700
      '#8fcea5', // light green
      '#5cb078', // medium green
      '#38915a', // primary green
      '#2a7447', // darker green
      '#bce4ca', // very light green
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
          Your Holdings
        </h2>
        <div className="text-center py-8 text-slate-500 dark:text-gray-400">
          Loading holdings...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 sm:p-8 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
        Your Holdings
      </h2>
      <div className="space-y-2">
        {displayedHoldings.map((holding, index) => {
          const weightPercent = Math.abs(holding.weight * 100);
          const isNegative = holding.weight < 0;
          const isExcluded = Math.abs(holding.weight) <= 0.0001;
          
          return (
            <div
              key={holding.ticker}
              className={`flex items-center gap-4 py-2 border-b border-slate-200 dark:border-gray-700 last:border-0 ${
                isExcluded ? 'opacity-50' : ''
              }`}
            >
              {/* Left: Ticker + Company Name */}
              <div className="flex-shrink-0 min-w-0 flex-1">
                <div className={`font-bold text-base ${
                  isExcluded 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {holding.ticker}
                </div>
                <div className={`hidden sm:block text-sm truncate ${
                  isExcluded 
                    ? 'text-gray-400 dark:text-gray-500' 
                    : 'text-slate-500 dark:text-gray-400'
                }`}>
                  {holding.name}
                </div>
              </div>

              {/* Center: Allocation Bar */}
              <div className="flex-1 min-w-0">
                <div className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(weightPercent, 100)}%`,
                      backgroundColor: isNegative ? '#ef4444' : getBarColor(index)
                    }}
                  />
                </div>
              </div>

              {/* Right: Allocation Percentage */}
              <div className="flex-shrink-0 text-right min-w-[60px]">
                <div className={`font-semibold text-base ${
                  isExcluded
                    ? 'text-gray-400 dark:text-gray-500'
                    : isNegative 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-slate-900 dark:text-white'
                }`}>
                  {weightPercent.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Excluded Assets Toggle */}
      {rejectedCount > 0 && !showExcluded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={() => setShowExcluded(true)}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Show {rejectedCount} unallocated asset{rejectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Hide Excluded Assets Toggle */}
      {showExcluded && rejectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={() => setShowExcluded(false)}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Hide unallocated assets
          </button>
        </div>
      )}
    </div>
  );
}

