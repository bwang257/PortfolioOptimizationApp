'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortfolioPresetGrid from '@/components/PortfolioPresetGrid';
import PortfolioPreview from '@/components/PortfolioPreview';
import TickerList from '@/components/TickerList';
import { PortfolioPreset } from '@/lib/portfolioPresets';

type SelectionMode = 'preset' | 'manual' | 'quick';

const quickStartPortfolios: { name: string; tickers: string[] }[] = [
  { name: 'Tech Giants', tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'] },
  { name: 'Major Banks', tickers: ['JPM', 'BAC', 'WFC', 'C', 'GS'] },
  { name: 'Major ETFs', tickers: ['SPY', 'QQQ', 'IWM', 'DIA'] },
  { name: 'Balanced Growth', tickers: ['AAPL', 'JPM', 'JNJ', 'XOM', 'PG', 'MSFT'] },
  { name: 'Dividend Focus', tickers: ['JNJ', 'PG', 'KO', 'PEP', 'XOM', 'CVX'] },
  { name: 'ESG Leaders', tickers: ['MSFT', 'NVDA', 'AAPL', 'GOOGL', 'NEE'] },
];

export default function StartPage() {
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PortfolioPreset | null>(null);
  const [tickers, setTickers] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePresetSelect = (preset: PortfolioPreset) => {
    setSelectedPreset(preset);
    setTickers([...preset.tickers]);
    setSelectionMode('preset');
    // Auto-scroll to preview after a short delay to allow DOM update
    setTimeout(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleQuickStart = (portfolio: { name: string; tickers: string[] }) => {
    setTickers([...portfolio.tickers]);
    setSelectedPreset(null);
    setSelectionMode('quick');
  };

  const handleContinue = () => {
    if (tickers.length === 0) {
      return;
    }

    // Store portfolio data in sessionStorage
    const portfolioData = {
      tickers,
      preset: selectedPreset ? {
        id: selectedPreset.id,
        name: selectedPreset.name,
        suggested_objective: selectedPreset.suggested_objective,
        suggested_esg_weight: selectedPreset.suggested_esg_weight || 0
      } : null,
      mode: selectionMode
    };

    sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
    router.push('/');
  };

  const handleClear = () => {
    setTickers([]);
    setSelectedPreset(null);
    setSelectionMode(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Optimizer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Optimize your stock portfolio using advanced risk-adjusted metrics
          </p>
        </div>

        {/* Selection Mode Buttons */}
        {!selectionMode && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => setSelectionMode('preset')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select from Presets
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from curated portfolio suggestions organized by category
              </p>
            </button>

            <button
              onClick={() => setSelectionMode('manual')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-4">✏️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Manual Entry
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your own tickers and build a custom portfolio
              </p>
            </button>

            <button
              onClick={() => setSelectionMode('quick')}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-transparent hover:border-blue-500"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Quick Start
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                One-click selection of popular portfolio options
              </p>
            </button>
          </div>
        )}

        {/* Preset Selection */}
        {selectionMode === 'preset' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Select a Portfolio Preset
              </h2>
              <button
                onClick={() => {
                  setSelectionMode(null);
                  handleClear();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-smooth"
              >
                ← Back
              </button>
            </div>
            <PortfolioPresetGrid
              selectedPresetId={selectedPreset?.id || null}
              onPresetSelect={handlePresetSelect}
            />
            
            {/* Portfolio Preview - Inline after preset grid */}
            {tickers.length > 0 && selectedPreset && (
              <div ref={previewRef} className="mt-6">
                <PortfolioPreview
                  tickers={tickers}
                  preset={selectedPreset}
                  onTickersChange={setTickers}
                  onClear={handleClear}
                />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleContinue}
                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-smooth hover-lift shadow-md hover:shadow-lg text-lg"
                    aria-label="Continue to optimization"
                  >
                    Continue to Optimization →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry */}
        {selectionMode === 'manual' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manual Portfolio Entry
              </h2>
              <button
                onClick={() => {
                  setSelectionMode(null);
                  handleClear();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-smooth"
              >
                ← Back
              </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <TickerList tickers={tickers} onChange={setTickers} maxTickers={30} />
            </div>
          </div>
        )}

        {/* Quick Start */}
        {selectionMode === 'quick' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Quick Start Portfolios
              </h2>
              <button
                onClick={() => {
                  setSelectionMode(null);
                  handleClear();
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-smooth"
              >
                ← Back
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickStartPortfolios.map((portfolio) => (
                <button
                  key={portfolio.name}
                  onClick={() => handleQuickStart(portfolio)}
                  className={`p-4 text-left rounded-lg border-2 transition-all ${
                    tickers.length > 0 && tickers.every(t => portfolio.tickers.includes(t)) && portfolio.tickers.every(t => tickers.includes(t))
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {portfolio.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {portfolio.tickers.join(', ')}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Preview - For manual and quick start modes */}
        {tickers.length > 0 && selectionMode !== 'preset' && (
          <div className="mt-8">
            <PortfolioPreview
              tickers={tickers}
              preset={selectedPreset}
              onTickersChange={setTickers}
              onClear={handleClear}
            />
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-smooth hover-lift shadow-md hover:shadow-lg text-lg"
                aria-label="Continue to optimization"
              >
                Continue to Optimization →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

