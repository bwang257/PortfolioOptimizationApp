'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioResponse } from '@/lib/api';
import PerformanceChart from '@/components/PerformanceChart';
import DrawdownChart from '@/components/DrawdownChart';
import EfficientFrontierChart from '@/components/EfficientFrontierChart';
import RollingMetricsChart from '@/components/RollingMetricsChart';
import CorrelationMatrix from '@/components/CorrelationMatrix';
import PortfolioCompositionChart from '@/components/PortfolioCompositionChart';
import RiskDecomposition from '@/components/RiskDecomposition';
import MetricsTable from '@/components/ResultsCard';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<string>('1Y');
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('portfolioResults');
    const storedPeriod = sessionStorage.getItem('backtestPeriod');
    if (stored) {
      try {
        setResults(JSON.parse(stored));
        if (storedPeriod) {
          setBacktestPeriod(storedPeriod);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Optimization Results
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Backtest Period: {backtestPeriod}
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-smooth hover-lift shadow-md hover:shadow-lg"
          >
            New Optimization
          </button>
        </div>

        {/* Key Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Key Metrics</h2>
          <MetricsTable
            expected_return={results.expected_return}
            volatility={results.volatility}
            sharpe_ratio={results.sharpe_ratio}
            sortino_ratio={results.sortino_ratio}
            calmar_ratio={results.calmar_ratio}
            max_drawdown={results.max_drawdown}
            total_leverage={results.total_leverage}
          />
        </div>

        {/* Portfolio Composition */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter" style={{ animationDelay: '0.1s' }}>
          <PortfolioCompositionChart weights={results.weights} />
        </div>

        {/* Performance Charts */}
        {results.price_history && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter chart-container-enter" style={{ animationDelay: '0.2s' }}>
            <PerformanceChart 
              priceHistory={results.price_history} 
              portfolioReturns={results.portfolio_returns}
            />
          </div>
        )}

        {/* Drawdown Chart */}
        {results.portfolio_returns && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter chart-container-enter" style={{ animationDelay: '0.3s' }}>
            <DrawdownChart portfolioReturns={results.portfolio_returns} />
          </div>
        )}

        {/* Efficient Frontier */}
        {results.efficient_frontier && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter chart-container-enter" style={{ animationDelay: '0.4s' }}>
            <EfficientFrontierChart
              efficientFrontier={results.efficient_frontier}
              currentRisk={results.volatility}
              currentReturn={results.expected_return}
            />
          </div>
        )}

        {/* Rolling Metrics */}
        {results.rolling_metrics && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter chart-container-enter" style={{ animationDelay: '0.5s' }}>
            <RollingMetricsChart rollingMetrics={results.rolling_metrics} />
          </div>
        )}

        {/* Correlation Matrix */}
        {results.correlation_matrix && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter" style={{ animationDelay: '0.6s' }}>
            <CorrelationMatrix 
              correlationMatrix={results.correlation_matrix}
              tickers={tickers}
            />
          </div>
        )}

        {/* Risk Decomposition */}
        {results.risk_decomposition && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter chart-container-enter" style={{ animationDelay: '0.7s' }}>
            <RiskDecomposition riskDecomposition={results.risk_decomposition} />
          </div>
        )}
      </div>
    </div>
  );
}
