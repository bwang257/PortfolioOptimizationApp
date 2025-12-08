'use client';

import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { PortfolioResponse } from '@/lib/api';
import WhyButton from './WhyButton';
import { explainPortfolioElement } from '@/lib/explanationGenerator';
import { isWeightCapped } from '@/lib/explanationGenerator';

interface AllocationListWithWhyProps {
  weights: Record<string, number>;
  portfolioData?: PortfolioResponse;
}

export default function AllocationListWithWhy({ weights, portfolioData }: AllocationListWithWhyProps) {
  const { isProMode } = useUserPreferences();

  const allocations = Object.entries(weights)
    .map(([ticker, weight]) => ({
      ticker,
      weight: Math.abs(weight),
      sign: weight >= 0 ? 'long' : 'short'
    }))
    .filter(item => item.weight > 0.01)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10); // Top 10 allocations

  return (
    <div className="space-y-2">
      {allocations.map(({ ticker, weight, sign }) => {
        const capped = portfolioData ? isWeightCapped(weight) : false;
        const explanation = portfolioData
          ? explainPortfolioElement('ticker', ticker, weight, portfolioData, isProMode)
          : null;

        return (
          <div
            key={ticker}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                {ticker}
              </span>
              {capped && (
                <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                  Capped
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                {(weight * 100).toFixed(1)}%
              </span>
              {explanation && (
                <WhyButton explanation={explanation} position="left">
                  <button className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </WhyButton>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

