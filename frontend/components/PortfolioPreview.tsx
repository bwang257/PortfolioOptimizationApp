'use client';

import { useState } from 'react';
import TickerList from './TickerList';
import { PortfolioPreset } from '@/lib/portfolioPresets';

interface PortfolioPreviewProps {
  tickers: string[];
  preset?: PortfolioPreset | null;
  onTickersChange: (tickers: string[]) => void;
  onClear: () => void;
}

export default function PortfolioPreview({ tickers, preset, onTickersChange, onClear }: PortfolioPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (tickers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Selected Portfolio
          </h3>
          {preset && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Based on: <span className="font-medium">{preset.name}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-smooth"
          >
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/30 transition-smooth"
          >
            Clear
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <TickerList tickers={tickers} onChange={onTickersChange} maxTickers={30} />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tickers.map((ticker) => (
              <span
                key={ticker}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {ticker}
                <button
                  onClick={() => onTickersChange(tickers.filter(t => t !== ticker))}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-fast"
                  aria-label={`Remove ${ticker}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tickers.length} stock{tickers.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {preset && !isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Preset Suggestions (Informational)
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
              💡 Objective: {preset.suggested_objective.replace('_', ' ')}
            </span>
            {preset.suggested_esg_weight !== undefined && preset.suggested_esg_weight > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs">
                💡 ESG Weight: {Math.round(preset.suggested_esg_weight * 100)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            These are suggestions only. You can adjust them in the optimization form.
          </p>
        </div>
      )}
    </div>
  );
}

