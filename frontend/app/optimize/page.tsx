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
import { optimizePortfolio, PortfolioRequest } from '@/lib/api';

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
    const labels: Record<string, string> = {
      sharpe: 'Sharpe Ratio',
      sortino: 'Sortino Ratio',
      calmar: 'Calmar Ratio',
      min_variance: 'Minimum Variance'
    };
    return labels[obj] || obj;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-smooth flex items-center gap-1"
            >
              ← Back to Presets
            </Link>
            <div className="flex-1"></div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Optimizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Optimize your stock portfolio using advanced risk-adjusted metrics
          </p>
          {presetName && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Based on preset: <span className="font-medium">{presetName}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 animate-fade-in hover-lift">
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
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 animate-slide-in">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || tickers.length === 0}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-smooth hover-lift shadow-md hover:shadow-lg disabled:hover:shadow-md disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

