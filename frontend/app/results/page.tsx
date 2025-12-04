'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioResponse } from '@/lib/api';
import PerformanceChart from '@/components/PerformanceChart';
import DrawdownChart from '@/components/DrawdownChart';
import EfficientFrontierChart from '@/components/EfficientFrontierChart';
import RollingMetricsChart from '@/components/RollingMetricsChart';
import PortfolioCompositionChart from '@/components/PortfolioCompositionChart';
import RiskDecomposition from '@/components/RiskDecomposition';
import MetricsTable from '@/components/ResultsCard';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<string>('1Y');
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
        sortino: 'Downside Protection',
        calmar: 'Recovery Strength',
        min_variance: 'Stability First'
      };
      return labels[obj] || obj;
    }
  };

  const getPortfolioTypeLabel = (type: string) => {
    return type === 'long_only' ? 'Long Only' : 'Long/Short';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end items-center gap-4 mb-6">
          <ProModeToggle />
          <ThemeToggle />
        </div>
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Your Portfolio Recommendation
              </h1>
              <p className="text-base text-gray-700 dark:text-gray-300">
                Based on {backtestPeriod} of historical data
              </p>
            </div>
            <button
              onClick={() => {
                // Clear sessionStorage when navigating to start page
                sessionStorage.removeItem('portfolioResults');
                sessionStorage.removeItem('backtestPeriod');
                sessionStorage.removeItem('optimizationObjective');
                sessionStorage.removeItem('portfolioType');
                router.push('/');
              }}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-card-sm hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 whitespace-nowrap"
              aria-label="Start a new portfolio optimization"
            >
              New Optimization
            </button>
          </div>
        </div>

        {/* Optimization Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Optimization Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-card-sm border border-gray-100 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Optimization Objective</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {optimizationObjective ? getObjectiveLabel(optimizationObjective) : 'N/A'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-card-sm border border-gray-100 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Portfolio Type</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {portfolioType ? getPortfolioTypeLabel(portfolioType) : 'N/A'}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-card-sm border border-gray-100 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide font-medium">Backtest Period</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {backtestPeriod}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">Portfolio Composition:</span> {tickers.length} stock{tickers.length !== 1 ? 's' : ''} ({tickers.join(', ')})
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white">Performance Metrics</h2>
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

        {/* Portfolio Composition */}
        <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter" style={{ animationDelay: '0.1s' }}>
          <PortfolioCompositionChart weights={results.weights} />
        </div>

        {/* Performance Charts */}
        {results.price_history && (
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter chart-container-enter" style={{ animationDelay: '0.2s' }}>
            <PerformanceChart 
              priceHistory={results.price_history} 
              portfolioReturns={results.portfolio_returns}
              benchmarkReturns={results.benchmark_returns}
            />
          </div>
        )}

        {/* Drawdown Chart */}
        {results.portfolio_returns && (
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter chart-container-enter" style={{ animationDelay: '0.3s' }}>
            <DrawdownChart portfolioReturns={results.portfolio_returns} />
          </div>
        )}

        {/* Efficient Frontier */}
        {results.efficient_frontier && (
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter chart-container-enter" style={{ animationDelay: '0.4s' }}>
            <EfficientFrontierChart
              efficientFrontier={results.efficient_frontier}
              currentRisk={results.volatility_theoretical ?? results.volatility}
              currentReturn={results.expected_return_theoretical ?? results.expected_return}
            />
          </div>
        )}

        {/* Rolling Metrics */}
        {results.rolling_metrics && (
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter chart-container-enter" style={{ animationDelay: '0.5s' }}>
            <RollingMetricsChart rollingMetrics={results.rolling_metrics} />
          </div>
        )}

        {/* Risk Decomposition */}
        {results.risk_decomposition && (
          <div className="bg-white dark:bg-gray-800 rounded-card shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 card-enter chart-container-enter" style={{ animationDelay: '0.7s' }}>
            <RiskDecomposition riskDecomposition={results.risk_decomposition} />
          </div>
        )}
      </div>
    </div>
  );
}
