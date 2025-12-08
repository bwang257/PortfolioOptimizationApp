'use client';

import { useState, useEffect } from 'react';
import { PaperTradingPortfolio as PaperTradingPortfolioType } from '@/lib/paperTrading';
import { format } from 'date-fns';

interface PaperTradingPortfolioProps {
  portfolio: PaperTradingPortfolioType;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}

export default function PaperTradingPortfolio({ portfolio, onDelete, onView }: PaperTradingPortfolioProps) {
  const returnPercent = ((portfolio.currentValue - portfolio.initialCapital) / portfolio.initialCapital) * 100;
  const isPositive = returnPercent >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{portfolio.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created {format(new Date(portfolio.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
            Practice
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Initial Capital</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            ${portfolio.initialCapital.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            ${portfolio.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Return</p>
          <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
          </p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isPositive ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, Math.abs(returnPercent))}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {portfolio.tickers.slice(0, 5).map((ticker) => (
          <span
            key={ticker}
            className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded"
          >
            {ticker}
          </span>
        ))}
        {portfolio.tickers.length > 5 && (
          <span className="px-2 py-0.5 text-xs text-slate-500 dark:text-gray-500">
            +{portfolio.tickers.length - 5} more
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(portfolio.id)}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onDelete(portfolio.id)}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

