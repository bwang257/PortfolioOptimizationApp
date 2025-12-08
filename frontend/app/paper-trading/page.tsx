'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  loadPaperTradingPortfolios,
  createPaperTradingPortfolio,
  deletePaperTradingPortfolio,
  PaperTradingPortfolio as PaperTradingPortfolioType
} from '@/lib/paperTrading';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import PaperTradingPortfolio from '@/components/PaperTradingPortfolio';
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer';
import Link from 'next/link';

export default function PaperTradingPage() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useUserPreferences();
  const [portfolios, setPortfolios] = useState<PaperTradingPortfolioType[]>([]);

  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    } else {
      const loaded = loadPaperTradingPortfolios();
      setPortfolios(loaded);
    }
  }, [hasCompletedOnboarding, router]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this paper trading portfolio?')) {
      deletePaperTradingPortfolio(id);
      setPortfolios(loadPaperTradingPortfolios());
    }
  };

  const handleView = (id: string) => {
    // Navigate to results page with paper trading portfolio data
    const portfolio = portfolios.find(p => p.id === id);
    if (portfolio && portfolio.portfolioData) {
      sessionStorage.setItem('portfolioResults', JSON.stringify(portfolio.portfolioData));
      sessionStorage.setItem('isPaperTrading', 'true');
      router.push('/results');
    }
  };

  const handleCreateFromResults = () => {
    // Check if there's a recent optimization result
    const results = sessionStorage.getItem('portfolioResults');
    if (results) {
      try {
        const data = JSON.parse(results);
        const portfolio = createPaperTradingPortfolio(
          `Portfolio ${new Date().toLocaleDateString()}`,
          Object.keys(data.weights),
          data.weights,
          data
        );
        setPortfolios([...portfolios, portfolio]);
        alert('Paper trading portfolio created!');
      } catch (e) {
        console.error('Failed to create paper trading portfolio:', e);
      }
    } else {
      alert('Please optimize a portfolio first, then come back here to create a paper trading portfolio.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
      <RegulatoryDisclaimer variant="banner" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paper Trading</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Practice with virtual money - no risk, all learning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProModeToggle />
            <ThemeToggle />
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              Back
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Practice Mode
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Paper trading lets you practice portfolio optimization with $10,000 virtual capital.
                No real money at risk - perfect for learning!
              </p>
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={handleCreateFromResults}
            className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Create Portfolio from Recent Optimization
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Optimize a portfolio first, then come back here to create a paper trading version.
          </p>
        </div>

        {/* Portfolios Grid */}
        {portfolios.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Paper Trading Portfolios Yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create your first paper trading portfolio to start practicing with virtual money.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <PaperTradingPortfolio
                key={portfolio.id}
                portfolio={portfolio}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

