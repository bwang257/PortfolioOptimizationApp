'use client';

import { PortfolioPreset } from '@/lib/portfolioPresets';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface PortfolioPresetCardProps {
  preset: PortfolioPreset;
  isSelected: boolean;
  onClick: () => void;
}

// Category colors for visual assets (circles/icons)
const categoryCircleColors: Record<string, string> = {
  'Tech': 'bg-blue-500',
  'Finance': 'bg-emerald-500',
  'Healthcare': 'bg-pink-400',
  'Energy': 'bg-amber-400',
  'Consumer': 'bg-purple-400',
  'ETFs': 'bg-indigo-400',
  'Diversified': 'bg-slate-400',
  'ESG-focused': 'bg-emerald-500',
};

// Pill colors (soft pastel backgrounds)
const categoryPillColors: Record<string, string> = {
  'Tech': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Finance': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Healthcare': 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  'Energy': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Consumer': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'ETFs': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  'Diversified': 'bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300',
  'ESG-focused': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export default function PortfolioPresetCard({ preset, isSelected, onClick }: PortfolioPresetCardProps) {
  const { isProMode } = useUserPreferences();
  const circleColor = categoryCircleColors[preset.category] || categoryCircleColors['Diversified'];
  const pillColor = categoryPillColors[preset.category] || categoryPillColors['Diversified'];
  const sampleTickers = preset.tickers.slice(0, 4).join(', ');
  const remainingCount = preset.tickers.length > 4 ? preset.tickers.length - 4 : 0;

  // Calculate risk level based on suggested objective
  const getRiskLevel = () => {
    if (preset.suggested_objective === 'min_variance') return { label: 'Low', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' };
    if (preset.suggested_objective === 'sharpe') return { label: 'Moderate', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' };
    if (preset.suggested_objective === 'sortino' || preset.suggested_objective === 'calmar') return { label: 'Moderate-High', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
    return { label: 'Moderate', color: 'bg-slate-50 text-slate-700 dark:bg-slate-700/30 dark:text-slate-300' };
  };

  const riskLevel = getRiskLevel();

  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-white dark:bg-gray-800 shadow-lg ring-2 ring-emerald-500 scale-[1.02]' 
          : 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md'
        }
      `}
    >
      {/* Visual Asset - Color-coded circle */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-12 h-12 ${circleColor} rounded-full flex-shrink-0 flex items-center justify-center shadow-sm`}>
          <span className="text-white font-bold text-lg">
            {preset.category.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {preset.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
            {preset.description}
          </p>
        </div>
        {isSelected && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${pillColor}`}>
          {preset.category}
        </span>
        <span className="text-xs text-slate-500 dark:text-gray-400 font-medium">
          {preset.tickers.length} stock{preset.tickers.length !== 1 ? 's' : ''}
        </span>
        {isProMode && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${riskLevel.color}`}>
            Risk: {riskLevel.label}
          </span>
        )}
      </div>

      {/* Tickers */}
      <div className="text-sm text-slate-700 dark:text-gray-300">
        <span className="font-semibold text-slate-900 dark:text-white">Tickers:</span>{' '}
        <span className={`text-slate-600 dark:text-gray-400 ${isProMode ? 'font-mono text-xs' : ''}`}>
          {sampleTickers}
          {remainingCount > 0 && ` +${remainingCount} more`}
        </span>
      </div>
    </div>
  );
}

