'use client';

import { PortfolioPreset } from '@/lib/portfolioPresets';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface PortfolioPresetCardProps {
  preset: PortfolioPreset;
  isSelected: boolean;
  onClick: () => void;
}

const categoryColors: Record<string, string> = {
  'Tech': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Finance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Healthcare': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Energy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Consumer': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'ETFs': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Diversified': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'ESG-focused': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
};

export default function PortfolioPresetCard({ preset, isSelected, onClick }: PortfolioPresetCardProps) {
  const { isProMode } = useUserPreferences();
  const categoryColor = categoryColors[preset.category] || categoryColors['Diversified'];
  const sampleTickers = preset.tickers.slice(0, 4).join(', ');
  const remainingCount = preset.tickers.length > 4 ? preset.tickers.length - 4 : 0;

  // Calculate risk level based on suggested objective
  const getRiskLevel = () => {
    if (preset.suggested_objective === 'min_variance') return { label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (preset.suggested_objective === 'sharpe') return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    if (preset.suggested_objective === 'sortino' || preset.suggested_objective === 'calmar') return { label: 'Moderate-High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    return { label: 'Moderate', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div
      onClick={onClick}
      className={`
        relative p-5 sm:p-6 rounded-card border-2 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-xl scale-[1.01]' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg'
        }
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {preset.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {preset.description}
          </p>
        </div>
        {isSelected && (
          <div className="ml-2 flex-shrink-0">
            <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColor}`}>
          {preset.category}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {preset.tickers.length} stock{preset.tickers.length !== 1 ? 's' : ''}
        </span>
        {isProMode && (
          <span className={`text-xs font-medium px-2 py-1 rounded ${riskLevel.color}`}>
            Risk: {riskLevel.label}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300">
        <span className="font-medium">Tickers:</span>{' '}
        <span className={`text-gray-600 dark:text-gray-400 ${isProMode ? 'font-mono text-xs' : ''}`}>
          {sampleTickers}
          {remainingCount > 0 && ` +${remainingCount} more`}
        </span>
      </div>
    </div>
  );
}

