'use client';

import { useState } from 'react';

interface RegulatoryDisclaimerProps {
  variant?: 'banner' | 'modal' | 'inline';
  onAccept?: () => void;
}

export default function RegulatoryDisclaimer({ variant = 'banner', onAccept }: RegulatoryDisclaimerProps) {
  const [isAccepted, setIsAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('regulatoryDisclaimerAccepted') === 'true';
    }
    return false;
  });

  const handleAccept = () => {
    setIsAccepted(true);
    localStorage.setItem('regulatoryDisclaimerAccepted', 'true');
    onAccept?.();
  };

  if (isAccepted && variant !== 'modal') {
    return null;
  }

  const content = (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        ⚠️ Educational Purpose Only
      </p>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        This application is for educational purposes only and does not constitute financial advice.
        All portfolio optimizations are simulations and should not be used for actual investment decisions.
        Past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions.
      </p>
      {variant === 'modal' && !isAccepted && (
        <button
          onClick={handleAccept}
          className="mt-3 w-full px-4 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
        >
          I Understand
        </button>
      )}
    </div>
  );

  if (variant === 'modal' && !isAccepted) {
    return (
      <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-600 p-4 mb-6">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-gray-800 rounded-lg p-3 border border-slate-200 dark:border-gray-700">
      {content}
    </div>
  );
}

