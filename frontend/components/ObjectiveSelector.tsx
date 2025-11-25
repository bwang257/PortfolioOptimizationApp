'use client';

import { useState } from 'react';

interface TickerListProps {
  tickers: string[];
  onChange: (tickers: string[]) => void;
  maxTickers?: number;
}

export default function TickerList({ tickers, onChange, maxTickers = 30 }: TickerListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const newTicker = inputValue.trim().toUpperCase();
    if (newTicker && !tickers.includes(newTicker) && tickers.length < maxTickers) {
      onChange([...tickers, newTicker]);
      setInputValue('');
    }
  };

  const handleRemove = (tickerToRemove: string) => {
    onChange(tickers.filter(t => t !== tickerToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Stock Tickers (max {maxTickers})
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter ticker (e.g., AAPL)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          disabled={tickers.length >= maxTickers}
        />
        <button
          onClick={handleAdd}
          disabled={!inputValue.trim() || tickers.length >= maxTickers}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
      {tickers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tickers.map((ticker) => (
            <span
              key={ticker}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {ticker}
              <button
                onClick={() => handleRemove(ticker)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {tickers.length === 0 && (
        <p className="text-sm text-gray-500">No tickers added yet</p>
      )}
    </div>
  );
}