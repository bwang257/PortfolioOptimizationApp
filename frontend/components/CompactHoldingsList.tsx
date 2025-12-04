'use client';

import { useState, useEffect } from 'react';
import { searchTickers, TickerInfo } from '@/lib/api';

interface CompactHoldingsListProps {
  weights: Record<string, number>;
}

interface Holding {
  ticker: string;
  name: string;
  weight: number;
}

export default function CompactHoldingsList({ weights }: CompactHoldingsListProps) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExcluded, setShowExcluded] = useState(false);

  useEffect(() => {
    const fetchCompanyNames = async () => {
      const tickers = Object.keys(weights);
      const holdingsData: Holding[] = [];

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
          holdingsData.push({
            ticker: ticker.toUpperCase(),
            name: ticker,
            weight: weights[ticker]
          });
        }
      }

      holdingsData.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));
      setHoldings(holdingsData);
      setLoading(false);
    };

    fetchCompanyNames();
  }, [weights]);

  const activeHoldings = holdings.filter(h => Math.abs(h.weight) > 0.0001);
  const excludedHoldings = holdings.filter(h => Math.abs(h.weight) <= 0.0001);
  const rejectedCount = excludedHoldings.length;
  const displayedHoldings = showExcluded ? holdings : activeHoldings;

  if (loading) {
    return (
      <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayedHoldings.map((holding) => {
        const weightPercent = Math.abs(holding.weight * 100);
        const isExcluded = Math.abs(holding.weight) <= 0.0001;
        
        return (
          <div
            key={holding.ticker}
            className={`flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
              isExcluded ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`font-semibold text-xs ${
                isExcluded 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {holding.ticker}
              </div>
              <div className={`hidden sm:block text-xs truncate ${
                isExcluded 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {holding.name}
              </div>
            </div>
            <div className={`text-xs font-semibold ${
              isExcluded
                ? 'text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-white'
            }`}>
              {weightPercent.toFixed(1)}%
            </div>
          </div>
        );
      })}

      {rejectedCount > 0 && !showExcluded && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowExcluded(true)}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Show {rejectedCount} unallocated asset{rejectedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {showExcluded && rejectedCount > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowExcluded(false)}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Hide unallocated assets
          </button>
        </div>
      )}
    </div>
  );
}

