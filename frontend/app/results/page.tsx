'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioResponse } from '@/lib/api';
import CompactPerformanceChart from '@/components/CompactPerformanceChart';
import CompactAllocationChart from '@/components/CompactAllocationChart';
import CompactRiskMetrics from '@/components/CompactRiskMetrics';
import CompactHoldingsList from '@/components/CompactHoldingsList';
import MetricsTable from '@/components/ResultsCard';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import LearningMoment from '@/components/LearningMoment';
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { BacktestPeriod } from '@/components/BacktestPeriodSelector';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<BacktestPeriod>('1Y');
  const [optimizationObjective, setOptimizationObjective] = useState<string>('');
  const [portfolioType, setPortfolioType] = useState<string>('');
  const router = useRouter();
  const { isProMode } = useUserPreferences();

  useEffect(() => {
    const stored = sessionStorage.getItem('portfolioResults');
    const storedPeriod = sessionStorage.getItem('backtestPeriod');
    const storedObjective = sessionStorage.getItem('optimizationObjective');
    const storedPortfolioType = sessionStorage.getItem('portfolioType');
    
    if (stored) {
      try {
        setResults(JSON.parse(stored));
        if (storedPeriod) {
          setBacktestPeriod(storedPeriod as BacktestPeriod);
        }
        if (storedObjective) {
          setOptimizationObjective(storedObjective);
        }
        if (storedPortfolioType) {
          setPortfolioType(storedPortfolioType);
        }
      } catch (err) {
        console.error('Failed to parse results:', err);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading results...</div>
      </div>
    );
  }

  const tickers = Object.keys(results.weights);

  const getObjectiveLabel = (obj: string) => {
    if (isProMode) {
      const labels: Record<string, string> = {
        sharpe: 'Sharpe Ratio',
        sortino: 'Sortino Ratio',
        calmar: 'Calmar Ratio',
        min_variance: 'Minimum Variance (Lowest Risk)'
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

  const getPortfolioTypeLabel = (type: string) => {
    if (isProMode) {
      return type === 'long_only' ? 'Long Only' : 'Long/Short';
    } else {
      return type === 'long_only' ? 'Buy Only' : 'Buy and Bet Against';
    }
  };

  // Calculate total return and current value
  const totalReturn = results.portfolio_returns && results.portfolio_returns.length > 0
    ? ((results.portfolio_returns[results.portfolio_returns.length - 1].value / results.portfolio_returns[0].value - 1) * 100)
    : 0;
  
  const currentValue = results.portfolio_returns && results.portfolio_returns.length > 0
    ? results.portfolio_returns[results.portfolio_returns.length - 1].value
    : 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      {results && <LearningMoment portfolioData={results} onDismiss={() => {}} />}
      <RegulatoryDisclaimer variant="banner" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {backtestPeriod} backtest period
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProModeToggle />
            <ThemeToggle />
            <button
              onClick={() => {
                sessionStorage.removeItem('portfolioResults');
                sessionStorage.removeItem('backtestPeriod');
                sessionStorage.removeItem('optimizationObjective');
                sessionStorage.removeItem('portfolioType');
                router.push('/');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all"
            >
              New Analysis
            </button>
          </div>
        </div>

        {/* CSS Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Performance Widget - Span 2 columns */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Portfolio Performance</h2>
              <select
                value={backtestPeriod}
                onChange={(e) => setBacktestPeriod(e.target.value as BacktestPeriod)}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="1Y">1 Year</option>
                <option value="2Y">2 Years</option>
                <option value="5Y">5 Years</option>
              </select>
            </div>
            {results.portfolio_returns && (
              <CompactPerformanceChart
                portfolioReturns={results.portfolio_returns}
                benchmarkReturns={results.benchmark_returns}
                totalReturn={totalReturn}
                currentValue={currentValue}
              />
            )}
          </div>

          {/* Allocation Widget - Span 1 column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4" data-tour="why-button">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Asset Allocation</h2>
            <CompactAllocationChart weights={results.weights} portfolioData={results} />
          </div>

          {/* Risk Analysis Widget - Span 1 column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Risk Metrics</h2>
            <CompactRiskMetrics
              volatility={results.volatility}
              sharpe_ratio={results.sharpe_ratio}
              sortino_ratio={results.sortino_ratio}
              max_drawdown={results.max_drawdown}
              calmar_ratio={results.calmar_ratio}
              isProMode={isProMode}
            />
          </div>

          {/* Holdings Widget - Span 3 columns */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top Positions</h2>
            <CompactHoldingsList weights={results.weights} />
          </div>

          {/* Full Metrics Table - Span 3 columns */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">All Performance Metrics</h2>
            <MetricsTable
              expected_return={results.expected_return}
              volatility={results.volatility}
              sharpe_ratio={results.sharpe_ratio}
              sortino_ratio={results.sortino_ratio}
              calmar_ratio={results.calmar_ratio}
              max_drawdown={results.max_drawdown}
              total_leverage={results.total_leverage}
              isSimpleMode={!isProMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
