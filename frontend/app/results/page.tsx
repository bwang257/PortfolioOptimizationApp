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
import ESGDisplay from '@/components/ESGDisplay';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const [backtestPeriod, setBacktestPeriod] = useState<string>('1Y');
  const [optimizationObjective, setOptimizationObjective] = useState<string>('');
  const [portfolioType, setPortfolioType] = useState<string>('');
  const [esgWeight, setEsgWeight] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('portfolioResults');
    const storedPeriod = sessionStorage.getItem('backtestPeriod');
    const storedObjective = sessionStorage.getItem('optimizationObjective');
    const storedPortfolioType = sessionStorage.getItem('portfolioType');
    const storedEsgWeight = sessionStorage.getItem('esgWeight');
    
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
        if (storedEsgWeight) {
          setEsgWeight(parseFloat(storedEsgWeight));
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
    const labels: Record<string, string> = {
      sharpe: 'Sharpe Ratio',
      sortino: 'Sortino Ratio',
      calmar: 'Calmar Ratio',
      min_variance: 'Minimum Variance (Lowest Risk)'
    };
    return labels[obj] || obj;
  };

  const getPortfolioTypeLabel = (type: string) => {
    return type === 'long_only' ? 'Long Only' : 'Long/Short';
  };

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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-smooth hover-lift shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Start a new portfolio optimization"
          >
            New Optimization
          </button>
        </div>

        {/* Optimization Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Optimization Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Optimization Objective</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {optimizationObjective ? getObjectiveLabel(optimizationObjective) : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Portfolio Type</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {portfolioType ? getPortfolioTypeLabel(portfolioType) : 'N/A'}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Backtest Period</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {backtestPeriod}
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ESG Importance</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {esgWeight > 0 ? `${Math.round(esgWeight * 100)}%` : 'Not Used'}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Portfolio Composition:</strong> {tickers.length} stock{tickers.length !== 1 ? 's' : ''} ({tickers.join(', ')})
            </div>
          </div>
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

        {/* ESG Information */}
        {(results.esg_weight && results.esg_weight > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6 hover-lift card-enter" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">ESG Sustainability Information</h2>
            <ESGDisplay
              esgWeight={results.esg_weight}
              portfolioEsgScore={results.portfolio_esg_score}
              tickerEsgScores={results.ticker_esg_scores}
              weights={results.weights}
            />
          </div>
        )}

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
