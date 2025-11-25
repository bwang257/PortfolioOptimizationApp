'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ResultsCard from '@/components/ResultsCard';
import { PortfolioResponse } from '@/lib/api';

export default function ResultsPage() {
  const [results, setResults] = useState<PortfolioResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('portfolioResults');
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to parse results:', err);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Optimization Results
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Optimization
          </button>
        </div>
        <ResultsCard results={results} />
      </div>
    </div>
  );
}