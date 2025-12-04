'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioResponse } from '@/lib/api';
import PerformanceLineChart from '@/components/PerformanceLineChart';
import DrawdownChart from '@/components/DrawdownChart';
import PortfolioCompositionChart from '@/components/PortfolioCompositionChart';
import RollingVolatilityChart from '@/components/RollingVolatilityChart';
import HoldingsList from '@/components/HoldingsList';
import MetricsTable from '@/components/ResultsCard';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

type TabType = 'Performance' | 'Drawdown' | 'Allocation' | 'Risk';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<string>('1Y');
  const [optimizationObjective, setOptimizationObjective] = useState<string>('');
  const [portfolioType, setPortfolioType] = useState<string>('');
  const [displayReturn, setDisplayReturn] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('Performance');
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
          setBacktestPeriod(storedPeriod);
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

  // Calculate the return to display (use hovered value or default to expected return)
  // expected_return is a decimal (e.g., 0.15 for 15%), so multiply by 100 for display
  const returnToDisplay = displayReturn !== null 
    ? displayReturn 
    : (results.expected_return * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          <ProModeToggle />
          <ThemeToggle />
        </div>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Your Portfolio
            </h1>
            <p className="text-base text-slate-600 dark:text-gray-400">
              Based on {backtestPeriod} of historical data
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('portfolioResults');
              sessionStorage.removeItem('backtestPeriod');
              sessionStorage.removeItem('optimizationObjective');
              sessionStorage.removeItem('portfolioType');
              router.push('/');
            }}
            className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 whitespace-nowrap"
            aria-label="Start a new portfolio optimization"
          >
            New Optimization
          </button>
        </div>

        {/* Unified Dashboard Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-6 sm:p-8 mb-8">
          {/* Header with Expected Return and Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Left Side: Expected Return */}
            <div className="flex-shrink-0">
              <div className="text-sm font-semibold text-slate-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                Expected Annual Return
              </div>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
                {returnToDisplay.toFixed(1)}%
              </div>
            </div>

            {/* Right Side: Segmented Control */}
            <div className="flex-shrink-0">
              <div className="inline-flex bg-slate-100 dark:bg-gray-700 p-1 rounded-full shadow-sm flex-wrap gap-1">
                {(['Performance', 'Drawdown', 'Risk', 'Allocation'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all duration-200
                      ${activeTab === tab
                        ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-md'
                        : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="relative" style={{ minHeight: '400px' }}>
            <div
              key={activeTab}
              className="animate-fade-in"
              style={{
                animation: 'fadeIn 0.3s ease-in-out'
              }}
            >
              {activeTab === 'Performance' && results.portfolio_returns && (
                <PerformanceLineChart
                  portfolioReturns={results.portfolio_returns}
                  benchmarkReturns={results.benchmark_returns}
                />
              )}
              {activeTab === 'Drawdown' && results.portfolio_returns && (
                <DrawdownChart portfolioReturns={results.portfolio_returns} />
              )}
              {activeTab === 'Allocation' && (
                <PortfolioCompositionChart weights={results.weights} />
              )}
              {activeTab === 'Risk' && results.rolling_metrics && (
                <RollingVolatilityChart rollingMetrics={results.rolling_metrics} />
              )}
            </div>
          </div>
        </div>

        {/* Holdings List */}
        <HoldingsList weights={results.weights} />

        {/* Full Metrics Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">All Performance Metrics</h2>
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
  );
}
