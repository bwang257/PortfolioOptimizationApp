'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PortfolioPresetGrid from '@/components/PortfolioPresetGrid';
import ThemeToggle from '@/components/ThemeToggle';
import ProModeToggle from '@/components/ProModeToggle';
import NewsFeed from '@/components/NewsFeed';
import AppTour from '@/components/AppTour';
import RegulatoryDisclaimer from '@/components/RegulatoryDisclaimer';
import { PortfolioPreset } from '@/lib/portfolioPresets';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function Home() {
  const router = useRouter();
  const { hasCompletedOnboarding } = useUserPreferences();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
    }
  }, [hasCompletedOnboarding, router]);

  const handlePresetSelect = (preset: PortfolioPreset) => {
    // Store preset data in sessionStorage and navigate directly to optimization form
    const portfolioData = {
      tickers: [...preset.tickers],
      preset: {
        id: preset.id,
        name: preset.name,
        suggested_objective: preset.suggested_objective
      },
      mode: 'preset'
    };

    sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
    router.push('/optimize');
  };

  const handleManualEntry = () => {
    // Navigate to optimization form without any preset data
    // Mark as manual entry to hide quick start examples
    sessionStorage.removeItem('portfolioSelection');
    sessionStorage.setItem('isManualEntry', 'true');
    router.push('/optimize');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <AppTour />
      <RegulatoryDisclaimer variant="banner" />
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-8 sm:mb-10">
          <div className="flex items-center gap-3">
            <Link
              href="/progress"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm"
            >
              Progress
            </Link>
            <Link
              href="/paper-trading"
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm"
            >
              Paper Trading
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ProModeToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
            Portfolio Optimizer
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Build an optimized investment portfolio tailored to your risk preferences
          </p>
        </div>

        {/* News Feed */}
        <NewsFeed />

        {/* Preset Selection */}
        <div className="space-y-6 sm:space-y-8 mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Choose a Portfolio Preset
            </h2>
            <button
              onClick={handleManualEntry}
              data-tour="optimize-button"
              className="px-6 py-3 text-sm font-semibold text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
            >
              Manual Entry
            </button>
          </div>
          <PortfolioPresetGrid
            selectedPresetId={selectedPresetId}
            onPresetSelect={handlePresetSelect}
          />
        </div>
      </div>
    </div>
  );
}
