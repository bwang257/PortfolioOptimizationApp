'use client';

import { useState, useEffect } from 'react';
import { mockNewsArticles, NewsArticle } from '@/lib/mockNewsData';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useRouter } from 'next/navigation';
import { loadProgress, recordActivity } from '@/lib/progressTracking';
import NewsArticleComponent from './NewsArticle';
import SimpleModeWizard from './SimpleModeWizard';

export default function NewsFeed() {
  const { isProMode } = useUserPreferences();
  const router = useRouter();
  const [draggedArticle, setDraggedArticle] = useState<NewsArticle | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDragStart = (article: NewsArticle) => {
    setDraggedArticle(article);
  };

  const handleDragEnd = () => {
    setDraggedArticle(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedArticle) {
      // Record news analysis activity
      const progress = loadProgress();
      recordActivity('news', progress);
      
      if (isProMode) {
        // Pro mode: instantly create draft portfolio
        const analysis = require('@/lib/newsParser').analyzeArticleForPortfolio(draggedArticle);
        const portfolioData = {
          tickers: analysis.mentionedTickers,
          mode: 'news',
          source: draggedArticle.headline
        };
        sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          router.push('/optimize');
        }, 2000);
      } else {
        // Simple mode: show wizard
        setShowWizard(true);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <>
      <div className="mb-8" data-tour="news-feed">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {isProMode ? 'Market News' : 'Financial News'}
          </h2>
          <div className="text-sm text-slate-500 dark:text-gray-400">
            {isProMode ? 'Drag articles to create draft portfolios' : 'Drag articles to build portfolios'}
          </div>
        </div>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`min-h-[200px] rounded-lg border-2 border-dashed p-4 transition-all duration-200 ${
            draggedArticle
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
              : 'border-slate-300 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-800/50'
          }`}
        >
          {draggedArticle && (
            <div className="text-center py-8">
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                {isProMode ? 'Drop to create draft portfolio' : 'Drop to start building your portfolio'}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                Release the article here
              </p>
            </div>
          )}
          
          {!draggedArticle && (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-slate-400 dark:text-gray-600 mb-2"
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
              <p className="text-slate-500 dark:text-gray-400 text-sm">
                {isProMode 
                  ? 'Drag news articles here to instantly create optimized portfolios'
                  : 'Drag news articles here to build portfolios with guidance'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {mockNewsArticles.map((article) => (
            <NewsArticleComponent
              key={article.id}
              article={article}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>

      {showWizard && draggedArticle && (
        <SimpleModeWizard
          article={draggedArticle}
          onClose={() => {
            setShowWizard(false);
            setDraggedArticle(null);
          }}
        />
      )}

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <p className="font-semibold">Draft portfolio created!</p>
          <p className="text-sm opacity-90">Redirecting to optimization...</p>
        </div>
      )}
    </>
  );
}

