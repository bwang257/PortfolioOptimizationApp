'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TickerList from '@/components/TickerList';
import ObjectiveSelector from '@/components/ObjectiveSelector';
import PortfolioTypeSelector from '@/components/PortfolioTypeSelector';
import BacktestPeriodSelector, { PERIOD_TO_DAYS, BacktestPeriod } from '@/components/BacktestPeriodSelector';
import Loader from '@/components/Loader';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import { optimizePortfolio, PortfolioRequest } from '@/lib/api';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { loadProgress, recordActivity } from '@/lib/progressTracking';

export default function OptimizePage() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [objective, setObjective] = useState<'sharpe' | 'sortino' | 'calmar' | 'min_variance'>('sharpe');
  const [portfolioType, setPortfolioType] = useState<'long_only' | 'long_short'>('long_only');
  const [backtestPeriod, setBacktestPeriod] = useState<BacktestPeriod>('1Y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetName, setPresetName] = useState<string | null>(null);
  const [presetSuggestions, setPresetSuggestions] = useState<{objective?: string} | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const router = useRouter();
  const { isProMode } = useUserPreferences();

  // Load pre-filled data from preset selection
  useEffect(() => {
    const portfolioSelection = sessionStorage.getItem('portfolioSelection');
    const manualEntryFlag = sessionStorage.getItem('isManualEntry');
    
    if (manualEntryFlag === 'true') {
      setIsManualEntry(true);
      sessionStorage.removeItem('isManualEntry');
    }
    
    if (portfolioSelection) {
      try {
        const data = JSON.parse(portfolioSelection);
        if (data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
          if (data.preset) {
            setPresetName(data.preset.name);
            // Store preset suggestions but don't auto-apply them
            // They will be shown as informational hints
            setPresetSuggestions({
              objective: data.preset.suggested_objective
            });
          }
        }
        // Clear the sessionStorage after loading
        sessionStorage.removeItem('portfolioSelection');
      } catch (err) {
        console.error('Failed to parse portfolio selection:', err);
      }
    }
  }, []);

  const getObjectiveLabel = (obj: string) => {
    if (isProMode) {
      const labels: Record<string, string> = {
        sharpe: 'Sharpe Ratio',
        sortino: 'Sortino Ratio',
        calmar: 'Calmar Ratio',
        min_variance: 'Minimum Variance'
      };
      return labels[obj] || obj;
    } else {
      const labels: Record<string, string> = {
        sharpe: 'Balanced Growth',
        sortino: 'Downside Protection Score',
        calmar: 'Recovery Strength Score',
        min_variance: 'Stability First'
      };
      return labels[obj] || obj;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tickers.length === 0) {
      setError('Please add at least one ticker');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: PortfolioRequest = {
        tickers,
        objective,
        portfolio_type: portfolioType,
        lookback_days: PERIOD_TO_DAYS[backtestPeriod],
      };

      const results = await optimizePortfolio(request);
      
      // Record portfolio creation activity
      const progress = loadProgress();
      recordActivity('portfolio', progress);
      
      // Store results and optimization parameters in sessionStorage
      sessionStorage.setItem('portfolioResults', JSON.stringify(results));
      sessionStorage.setItem('backtestPeriod', backtestPeriod);
      sessionStorage.setItem('optimizationObjective', objective);
      sessionStorage.setItem('portfolioType', portfolioType);
      router.push('/results');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to optimize portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 pb-24 sm:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="flex justify-end items-center gap-4 mb-6">
          <ProModeToggle />
          <ThemeToggle />
        </div>
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-smooth flex items-center gap-1.5 font-semibold"
            >
              ← Back to Presets
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Build Your Portfolio
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create an optimized investment portfolio tailored to your risk preferences
          </p>
          {presetName && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-3 font-semibold">
              Based on preset: <span className="font-bold">{presetName}</span>
            </p>
          )}
        </div>

        <form id="optimize-form" onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
          <TickerList tickers={tickers} onChange={setTickers} />
          
          <BacktestPeriodSelector value={backtestPeriod} onChange={setBacktestPeriod} />
          
          <div className="space-y-4">
            <ObjectiveSelector value={objective} onChange={setObjective} />
            {presetSuggestions?.objective && (
              <div className="ml-1 -mt-1">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  💡 Suggested: {getObjectiveLabel(presetSuggestions.objective)}
                </span>
              </div>
            )}
          </div>
          
          <PortfolioTypeSelector value={portfolioType} onChange={setPortfolioType} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-0 rounded-2xl p-4 animate-slide-in shadow-sm">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold">{error}</p>
            </div>
          )}

          {loading && <Loader />}
        </form>
      </div>

      {/* Sticky Optimize Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 shadow-lg sm:hidden z-50 p-4">
        <button
          type="submit"
          form="optimize-form"
          disabled={loading || tickers.length === 0}
          className="w-full py-4 px-6 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-base"
          aria-label="Optimize portfolio with selected parameters"
          aria-busy={loading}
        >
          {loading ? 'Optimizing...' : 'Optimize Portfolio'}
        </button>
      </div>

      {/* Desktop Optimize Button */}
      <div className="hidden sm:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <button
          type="submit"
          form="optimize-form"
          disabled={loading || tickers.length === 0}
          className="w-full py-5 px-8 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 text-lg"
          aria-label="Optimize portfolio with selected parameters"
          aria-busy={loading}
        >
          {loading ? 'Optimizing...' : 'Optimize Portfolio'}
        </button>
      </div>
    </div>
  );
}

