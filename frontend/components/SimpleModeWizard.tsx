'use client';

import { useState } from 'react';
import { NewsArticle } from '@/lib/mockNewsData';
import { analyzeArticleForPortfolio } from '@/lib/newsParser';
import { useRouter } from 'next/navigation';
import CommunityInsights from './CommunityInsights';

interface SimpleModeWizardProps {
  article: NewsArticle;
  onClose: () => void;
}

export default function SimpleModeWizard({ article, onClose }: SimpleModeWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const analysis = analyzeArticleForPortfolio(article);

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Create portfolio with mentioned tickers + suggested additions
      const allTickers = [...analysis.mentionedTickers, ...analysis.suggestedAdditions];
      const portfolioData = {
        tickers: allTickers,
        mode: 'news',
        source: article.headline
      };
      sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
      router.push('/optimize');
      onClose();
    }
  };

  const handleSkip = () => {
    // Just use mentioned tickers
    const portfolioData = {
      tickers: analysis.mentionedTickers,
      mode: 'news',
      source: article.headline
    };
    sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
    router.push('/optimize');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-in">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-gray-400">
              Step {step} of 3
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Article Analysis
            </h2>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              This article mentions the following stocks:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {analysis.mentionedTickers.map((ticker) => (
                <span
                  key={ticker}
                  className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg font-semibold"
                >
                  {ticker}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-500">
              We'll help you build a balanced portfolio from these stocks.
            </p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Risk Balancing
            </h2>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              To balance risk, we recommend adding these safer stocks:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {analysis.suggestedAdditions.map((ticker) => (
                <span
                  key={ticker}
                  className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold"
                >
                  {ticker}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-500">
              These stocks help protect your portfolio if the tech sector crashes.
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Optimize
            </h2>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              Your portfolio will include:
            </p>
            <div className="space-y-2 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  From article:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.mentionedTickers.map((ticker) => (
                    <span
                      key={ticker}
                      className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded text-sm"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                  Added for balance:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedAdditions.map((ticker) => (
                    <span
                      key={ticker}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                    >
                      {ticker}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const allTickers = [...analysis.mentionedTickers, ...analysis.suggestedAdditions];
                const portfolioData = {
                  tickers: allTickers,
                  mode: 'news',
                  source: article.headline
                };
                sessionStorage.setItem('portfolioSelection', JSON.stringify(portfolioData));
                router.push('/optimize');
                onClose();
              }}
              className="w-full px-4 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors mb-2"
            >
              See Why This Works
            </button>
            <p className="text-xs text-slate-500 dark:text-gray-500 text-center">
              Click to learn about portfolio optimization
            </p>
          </div>
        )}

        {/* Community Insights */}
        {step === 2 && (
          <div className="mt-4">
            <CommunityInsights article={article} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {step === 3 ? 'Optimize Portfolio' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

