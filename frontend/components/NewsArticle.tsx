'use client';

import { useState } from 'react';
import { NewsArticle as NewsArticleType } from '@/lib/mockNewsData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface NewsArticleProps {
  article: NewsArticleType;
  onDragStart: (article: NewsArticleType) => void;
  onDragEnd: () => void;
}

export default function NewsArticle({ article, onDragStart, onDragEnd }: NewsArticleProps) {
  const { isProMode } = useUserPreferences();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', article.id);
    onDragStart(article);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const headline = isProMode ? article.headlinePro : article.headlineSimple;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-move transition-all duration-200 ${
        isDragging
          ? 'opacity-50 border-emerald-500 shadow-lg scale-95'
          : 'border-slate-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 text-sm sm:text-base">
            {headline}
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">
            {article.source} • {new Date(article.date).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {article.tickers.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {article.tickers.map((ticker) => (
            <span
              key={ticker}
              className="px-2 py-0.5 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded"
            >
              {ticker}
            </span>
          ))}
        </div>
      )}
      
      <p className="text-xs text-slate-600 dark:text-gray-400 mt-2 line-clamp-2">
        {article.content}
      </p>
      
      <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        {isProMode ? 'Drag to create draft portfolio' : 'Drag to build portfolio'}
      </div>
    </div>
  );
}

