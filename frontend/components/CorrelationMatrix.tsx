'use client';

interface CorrelationMatrixProps {
  correlationMatrix: Record<string, Record<string, number>>;
  tickers: string[];
}

export default function CorrelationMatrix({ correlationMatrix, tickers }: CorrelationMatrixProps) {
  const getColor = (value: number) => {
    // Color scale from red (negative) to blue (positive)
    if (value < 0) {
      const intensity = Math.abs(value);
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red
    } else {
      return `rgba(59, 130, 246, ${0.3 + value * 0.7})`; // Blue
    }
  };
  
  const getTextColor = (value: number) => {
    return Math.abs(value) > 0.5 ? 'text-white' : 'text-gray-900 dark:text-white';
  };
  
  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Correlation Matrix
      </h3>
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-800 text-left text-xs font-medium text-gray-700 dark:text-gray-300 sticky left-0 z-10 whitespace-nowrap">
                Ticker
              </th>
              {tickers.map((ticker) => (
                <th
                  key={ticker}
                  className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[80px] whitespace-nowrap"
                >
                  {ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tickers.map((ticker1) => (
              <tr key={ticker1}>
                <td className="border border-gray-300 dark:border-gray-600 p-2 bg-gray-100 dark:bg-gray-800 font-medium text-xs text-gray-700 dark:text-gray-300 sticky left-0 z-10 whitespace-nowrap">
                  {ticker1}
                </td>
                {tickers.map((ticker2) => {
                  const correlation = correlationMatrix[ticker1]?.[ticker2] ?? 0;
                  return (
                    <td
                      key={`${ticker1}-${ticker2}`}
                      className="border border-gray-300 dark:border-gray-600 p-2 text-center text-xs whitespace-nowrap"
                      style={{ backgroundColor: getColor(correlation) }}
                    >
                      <span className={getTextColor(correlation)}>
                        {correlation.toFixed(2)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Negative Correlation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Positive Correlation</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
        Correlation values range from -1 (perfect negative) to +1 (perfect positive). Values closer to 0 indicate less correlation.
      </p>
    </div>
  );
}

