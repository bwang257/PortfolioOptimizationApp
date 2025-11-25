'use client';

import WeightsChart from './WeightsChart';
import MetricsTable from './MetricsTable';
import { PortfolioResponse } from '@/lib/api';

interface ResultsCardProps {
  results: PortfolioResponse;
}

export default function ResultsCard({ results }: ResultsCardProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <WeightsChart weights={results.weights} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Portfolio Metrics
        </h3>
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
    </div>
  );
}