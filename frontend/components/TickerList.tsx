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
    if (tickerToAdd && !tickers.includes(tickerToAdd) && tickers.length < maxTickers) {
      onChange([...tickers, tickerToAdd]);
      setInputValue('');
      setShowSuggestions(false);
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
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onFocus={() => {
              if (inputValue.trim().length >= 1 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Search by ticker symbol (e.g., AAPL) or company name (e.g., Apple)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-smooth"
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
              className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {suggestions.map((ticker, index) => (
                <div
                  key={ticker.symbol}
                  role="option"
                  aria-selected={index === selectedIndex}
                  onClick={() => handleSuggestionClick(ticker)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 ${
                    index === selectedIndex ? 'bg-blue-100 dark:bg-gray-700' : ''
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
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-smooth hover-lift shadow-md hover:shadow-lg disabled:hover:shadow-md disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Add ticker to portfolio"
        >
          Add
        </button>
      </div>
      {tickers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tickers.map((ticker) => (
            <span
              key={ticker}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 transition-smooth hover:bg-blue-200 dark:hover:bg-blue-800 animate-scale-in"
            >
              {ticker}
              <button
                onClick={() => handleRemove(ticker)}
                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-fast rounded-full hover:bg-blue-300 dark:hover:bg-blue-700 px-1"
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
            No tickers added yet. Search by ticker symbol (e.g., AAPL) or company name (e.g., Apple) above.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Tip: You can search by either the stock ticker symbol or the company name. Click "Add" or press Enter to add a ticker.
          </p>
        </div>
      )}
    </div>
  );
}
