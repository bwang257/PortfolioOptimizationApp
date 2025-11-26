'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TickerList from '@/components/TickerList';
import ObjectiveSelector from '@/components/ObjectiveSelector';
import PortfolioTypeSelector from '@/components/PortfolioTypeSelector';
import BacktestPeriodSelector, { PERIOD_TO_DAYS, BacktestPeriod } from '@/components/BacktestPeriodSelector';
import Loader from '@/components/Loader';
import { optimizePortfolio, PortfolioRequest } from '@/lib/api';

export default function Home() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [objective, setObjective] = useState<'sharpe' | 'sortino' | 'calmar'>('sharpe');
  const [portfolioType, setPortfolioType] = useState<'long_only' | 'long_short'>('long_only');
  const [backtestPeriod, setBacktestPeriod] = useState<BacktestPeriod>('1Y');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      
      // Store results in sessionStorage and navigate
      sessionStorage.setItem('portfolioResults', JSON.stringify(results));
      sessionStorage.setItem('backtestPeriod', backtestPeriod);
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Portfolio Optimizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Optimize your stock portfolio using advanced risk-adjusted metrics
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6 animate-fade-in hover-lift">
          <TickerList tickers={tickers} onChange={setTickers} />
          
          <BacktestPeriodSelector value={backtestPeriod} onChange={setBacktestPeriod} />
          
          <ObjectiveSelector value={objective} onChange={setObjective} />
          
          <PortfolioTypeSelector value={portfolioType} onChange={setPortfolioType} />

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 animate-slide-in">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || tickers.length === 0}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-smooth hover-lift shadow-md hover:shadow-lg disabled:hover:shadow-md disabled:hover:translate-y-0"
          >
            {loading ? 'Optimizing...' : 'Optimize Portfolio'}
          </button>

          {loading && <Loader />}
        </form>
      </div>
    </div>
  );
}
