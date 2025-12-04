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
        sortino: 'Downside Protection',
        calmar: 'Recovery Strength',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          <ProModeToggle />
          <ThemeToggle />
        </div>
        <div className="text-center mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-smooth flex items-center gap-1.5 font-medium"
            >
              ← Back to Presets
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Build Your Portfolio
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create an optimized investment portfolio tailored to your risk preferences
          </p>
          {presetName && (
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-3 font-medium">
              Based on preset: <span className="font-semibold">{presetName}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 space-y-8 animate-fade-in">
          <TickerList tickers={tickers} onChange={setTickers} />
          
          <BacktestPeriodSelector value={backtestPeriod} onChange={setBacktestPeriod} />
          
          <div className="space-y-2">
            <ObjectiveSelector value={objective} onChange={setObjective} />
            {presetSuggestions?.objective && (
              <div className="ml-1 -mt-1">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                  Suggested : {getObjectiveLabel(presetSuggestions.objective)}
                </span>
              </div>
            )}
          </div>
          
          <PortfolioTypeSelector value={portfolioType} onChange={setPortfolioType} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card-sm p-4 animate-slide-in">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || tickers.length === 0}
            className="w-full py-4 px-6 bg-primary-600 text-white font-semibold rounded-card-sm hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-base"
            aria-label="Optimize portfolio with selected parameters"
            aria-busy={loading}
          >
            {loading ? 'Optimizing...' : 'Optimize Portfolio'}
          </button>

          {loading && <Loader />}
        </form>
      </div>
    </div>
  );
}

