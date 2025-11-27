'use client';

import { useState } from 'react';
import { PortfolioPreset, categories, getPresetsByCategory, searchPresets } from '@/lib/portfolioPresets';
import PortfolioPresetCard from './PortfolioPresetCard';

interface PortfolioPresetGridProps {
  selectedPresetId: string | null;
  onPresetSelect: (preset: PortfolioPreset) => void;
}

export default function PortfolioPresetGrid({ selectedPresetId, onPresetSelect }: PortfolioPresetGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPresets = searchQuery
    ? searchPresets(searchQuery)
    : getPresetsByCategory(selectedCategory);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search presets by name, description, or ticker..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          aria-label="Search portfolio presets"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category Filter */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
        {searchQuery && ` for "${searchQuery}"`}
      </div>

      {/* Preset Grid */}
      {filteredPresets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map((preset) => (
            <PortfolioPresetCard
              key={preset.id}
              preset={preset}
              isSelected={selectedPresetId === preset.id}
              onClick={() => onPresetSelect(preset)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No presets found. Try a different search or category.
          </p>
        </div>
      )}
    </div>
  );
}

