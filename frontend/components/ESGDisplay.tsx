'use client';

interface ESGDisplayProps {
  esgWeight?: number | null;
  portfolioEsgScore?: number | null;
  tickerEsgScores?: Record<string, number>;
  weights: Record<string, number>;
}

export default function ESGDisplay({ esgWeight, portfolioEsgScore, tickerEsgScores, weights }: ESGDisplayProps) {
  // Don't show if no ESG data
  if (!esgWeight || esgWeight === 0) {
    return null;
  }

  const getEsgRating = (score: number): { label: string; color: string; description: string } => {
    if (score <= 10) {
      return { label: 'Excellent', color: 'text-green-600 dark:text-green-400', description: 'Very low ESG risk' };
    } else if (score <= 20) {
      return { label: 'Good', color: 'text-green-500 dark:text-green-500', description: 'Low ESG risk' };
    } else if (score <= 30) {
      return { label: 'Average', color: 'text-yellow-600 dark:text-yellow-400', description: 'Moderate ESG risk' };
    } else if (score <= 40) {
      return { label: 'Below Average', color: 'text-orange-600 dark:text-orange-400', description: 'Higher ESG risk' };
    } else {
      return { label: 'Poor', color: 'text-red-600 dark:text-red-400', description: 'High ESG risk' };
    }
  };

  const portfolioRating = portfolioEsgScore ? getEsgRating(portfolioEsgScore) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ESG Weight Used */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">ESG Importance Weight</div>
          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {Math.round((esgWeight || 0) * 100)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {Math.round((1 - (esgWeight || 0)) * 100)}% financial performance, {Math.round((esgWeight || 0) * 100)}% ESG sustainability
          </div>
        </div>

        {/* Portfolio ESG Score */}
        {portfolioEsgScore !== null && portfolioEsgScore !== undefined && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Portfolio ESG Score</div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolioEsgScore.toFixed(1)}
              </div>
              {portfolioRating && (
                <span className={`text-sm font-semibold ${portfolioRating.color}`}>
                  {portfolioRating.label}
                </span>
              )}
            </div>
            {portfolioRating && (
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {portfolioRating.description} (Lower is better)
              </div>
            )}
          </div>
        )}
      </div>

      {/* Individual Ticker ESG Scores */}
      {tickerEsgScores && Object.keys(tickerEsgScores).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Individual Stock ESG Scores
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {Object.entries(tickerEsgScores)
              .sort(([, scoreA], [, scoreB]) => scoreA - scoreB) // Sort by score (lower is better)
              .map(([ticker, score]) => {
                const rating = getEsgRating(score);
                const weight = weights[ticker] || 0;
                return (
                  <div
                    key={ticker}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">{ticker}</span>
                      <span className={`text-sm font-medium ${rating.color}`}>
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        Weight: {(weight * 100).toFixed(1)}%
                      </span>
                      <span className={`font-medium ${rating.color}`}>
                        {rating.label}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

