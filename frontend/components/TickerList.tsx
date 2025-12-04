'use client';

import { useState, useEffect, useRef } from 'react';
import { searchTickers, TickerInfo } from '@/lib/api';

interface TickerListProps {
  tickers: string[];
  onChange: (tickers: string[]) => void;
  maxTickers?: number;
}

export default function TickerList({ tickers, onChange, maxTickers = 30 }: TickerListProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<TickerInfo[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      // Debounce search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const results = await searchTickers(inputValue);
          setSuggestions(results);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Error searching tickers:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (ticker?: string) => {
    const tickerToAdd = ticker || inputValue.trim().toUpperCase();
    
    // Validate that the ticker is in the search results (searchable/valid)
    if (ticker) {
      // Ticker was selected from suggestions - always valid
      if (tickerToAdd && !tickers.includes(tickerToAdd) && tickers.length < maxTickers) {
        onChange([...tickers, tickerToAdd]);
        setInputValue('');
        setShowSuggestions(false);
        setError(null);
      }
    } else {
      // User typed and pressed Enter - must be in suggestions
      const isValidTicker = suggestions.some(s => s.symbol.toUpperCase() === tickerToAdd);
      
      if (!tickerToAdd) {
        setError('Please enter a ticker symbol');
        return;
      }
      
      if (!isValidTicker) {
        setError(`"${tickerToAdd}" not found. Please select from search results.`);
        return;
      }
      
      if (tickers.includes(tickerToAdd)) {
        setError(`"${tickerToAdd}" is already added`);
        return;
      }
      
      if (tickers.length >= maxTickers) {
        setError(`Maximum ${maxTickers} tickers allowed`);
        return;
      }
      
      // Valid ticker from suggestions
      onChange([...tickers, tickerToAdd]);
      setInputValue('');
      setShowSuggestions(false);
      setError(null);
    }
  };

  const handleRemove = (tickerToRemove: string) => {
    onChange(tickers.filter(t => t !== tickerToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAdd(suggestions[selectedIndex].symbol);
      } else {
        handleAdd();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (ticker: TickerInfo) => {
    handleAdd(ticker.symbol);
  };

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Stock Tickers (max {maxTickers})
      </label>
      <div className="flex gap-2 relative">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null); // Clear error when user types
            }}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (inputValue.trim().length >= 1 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search for ticker symbol or company name"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-card-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-200"
            disabled={tickers.length >= maxTickers}
            aria-label="Search for stock ticker or company name"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="ticker-suggestions"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              id="ticker-suggestions"
              role="listbox"
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-card-sm shadow-xl max-h-60 overflow-auto"
            >
              {suggestions.map((ticker, index) => (
                <div
                  key={ticker.symbol}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleSuggestionClick(ticker)}
                  className={`px-4 py-2.5 cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white ${
                    index === selectedIndex ? 'bg-primary-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {ticker.symbol}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {ticker.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => handleAdd()}
          disabled={!inputValue.trim() || tickers.length >= maxTickers}
          className="px-5 py-3 bg-primary-600 text-white font-semibold rounded-card-sm hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:hover:shadow-md disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Add ticker to portfolio"
        >
          Add
        </button>
      </div>
      {error && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-card-sm">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      {tickers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tickers.map((ticker) => (
            <span
              key={ticker}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 transition-all duration-200 hover:bg-primary-200 dark:hover:bg-primary-800 animate-scale-in"
            >
              {ticker}
              <button
                onClick={() => handleRemove(ticker)}
                className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 transition-fast rounded-full hover:bg-primary-200 dark:hover:bg-primary-700 px-1"
                aria-label={`Remove ${ticker}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {tickers.length === 0 && (
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tickers added yet.
          </p>
        </div>
      )}
    </div>
  );
}
