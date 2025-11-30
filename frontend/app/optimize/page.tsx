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
  const [esgWeight, setEsgWeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presetName, setPresetName] = useState<string | null>(null);
  const [presetSuggestions, setPresetSuggestions] = useState<{objective?: string; esgWeight?: number} | null>(null);
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
              objective: data.preset.suggested_objective,
              esgWeight: data.preset.suggested_esg_weight
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
        esg_weight: esgWeight > 0 ? esgWeight : undefined,
      };

      const results = await optimizePortfolio(request);
      
      // Store results and optimization parameters in sessionStorage
      sessionStorage.setItem('portfolioResults', JSON.stringify(results));
      sessionStorage.setItem('backtestPeriod', backtestPeriod);
      sessionStorage.setItem('optimizationObjective', objective);
      sessionStorage.setItem('portfolioType', portfolioType);
      sessionStorage.setItem('esgWeight', esgWeight.toString());
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
          {/* Quick Start Examples - Only show if not manual entry */}
          {tickers.length === 0 && !isManualEntry && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">Quick Start Examples:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTickers(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'])}
                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-smooth"
                >
                  Tech Giants
                </button>
                <button
                  type="button"
                  onClick={() => setTickers(['JPM', 'BAC', 'WFC', 'C', 'GS'])}
                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-smooth"
                >
                  Banks
                </button>
                <button
                  type="button"
                  onClick={() => setTickers(['SPY', 'QQQ', 'IWM', 'DIA'])}
                  className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-smooth"
                >
                  ETFs
                </button>
              </div>
            </div>
          )}
          
          <TickerList tickers={tickers} onChange={setTickers} />
          
          <BacktestPeriodSelector value={backtestPeriod} onChange={setBacktestPeriod} />
          
          <div className="space-y-2">
            <ObjectiveSelector value={objective} onChange={setObjective} />
            {presetSuggestions?.objective && (
              <div className="ml-1 -mt-1">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                  💡 Preset suggests: {presetSuggestions.objective.replace('_', ' ')} objective
                </span>
              </div>
            )}
          </div>
          
          <PortfolioTypeSelector value={portfolioType} onChange={setPortfolioType} />

          {/* ESG Importance Slider */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ESG Importance (Sustainability Weight)
              </label>
              {presetSuggestions?.esgWeight !== undefined && presetSuggestions.esgWeight > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs">
                  💡 Preset suggests: {Math.round(presetSuggestions.esgWeight * 100)}%
                </span>
              )}
              <div className="group relative">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  ESG (Environmental, Social, Governance) scores measure a company's sustainability and ethical impact. Lower scores are better. When enabled, the optimizer balances financial returns with ESG performance based on your selected weight.
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={esgWeight}
                onChange={(e) => setEsgWeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                aria-label="ESG Importance Weight"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(esgWeight * 100)}%
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {esgWeight === 0 
                    ? 'No ESG consideration' 
                    : esgWeight < 0.3 
                    ? 'Low ESG priority' 
                    : esgWeight < 0.7 
                    ? 'Moderate ESG priority' 
                    : 'High ESG priority'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Balance between financial performance ({Math.round((1 - esgWeight) * 100)}%) and ESG sustainability ({Math.round(esgWeight * 100)}%)
              </p>
            </div>
          </div>

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

