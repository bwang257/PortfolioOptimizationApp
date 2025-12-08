'use client';

import { CommunityInsight, getCommunityInsightsForArticle } from '@/lib/communityData';
import { NewsArticle } from '@/lib/mockNewsData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface CommunityInsightsProps {
  article: NewsArticle;
}

export default function CommunityInsights({ article }: CommunityInsightsProps) {
  const { knowledgeLevel } = useUserPreferences();
  const insights = getCommunityInsightsForArticle(
    article.tickers,
    knowledgeLevel === 'new' ? 'beginner' : knowledgeLevel === 'basics' ? 'intermediate' : 'advanced'
  );

  if (insights.length === 0) return null;

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'positive':
        return '✅';
      case 'negative':
        return '❌';
      default:
        return '➖';
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">👥</span>
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
          See how {insights.length} other {knowledgeLevel === 'new' ? 'beginners' : knowledgeLevel === 'basics' ? 'users' : 'advanced users'} approached this news
        </h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-100 dark:border-blue-800"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getOutcomeIcon(insight.outcome)}</span>
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">
                  {insight.userLevel}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
              {insight.approach}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {insight.tickersAdded.map((ticker) => (
                <span
                  key={ticker}
                  className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                >
                  {ticker}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
              "{insight.reasoning}"
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
        All insights are anonymized for privacy
      </p>
    </div>
  );
}

