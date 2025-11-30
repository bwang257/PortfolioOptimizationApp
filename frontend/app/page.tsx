'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioPresetGrid from '@/components/PortfolioPresetGrid';
import ThemeToggle from '@/components/ThemeToggle';
import { PortfolioPreset } from '@/lib/portfolioPresets';

export default function Home() {
  const router = useRouter();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const handlePresetSelect = (preset: PortfolioPreset) => {
    // Store preset data in sessionStorage and navigate directly to optimization form
    const portfolioData = {
      tickers: [...preset.tickers],
      preset: {
        id: preset.id,
        name: preset.name,
        suggested_objective: preset.suggested_objective,
        suggested_esg_weight: preset.suggested_esg_weight || 0
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Optimizer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Optimize your stock portfolio using advanced risk-adjusted metrics
          </p>
        </div>

        {/* Preset Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Select a Portfolio Preset
            </h2>
            <button
              onClick={handleManualEntry}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 transition-smooth"
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
