'use client';

import { useState, useRef, useEffect } from 'react';
import { Explanation } from '@/lib/educationalContent';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface WhyButtonProps {
  explanation: Explanation;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function WhyButton({ explanation, children, position = 'top' }: WhyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isProMode } = useUserPreferences();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-help"
      >
        {children}
      </div>

      {isOpen && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()} w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-slate-200 dark:border-gray-700 p-4 animate-fade-in`}
        >
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-slate-200 dark:border-gray-700 ${
              position === 'bottom'
                ? '-top-1 left-1/2 -translate-x-1/2 rotate-45'
                : position === 'top'
                ? '-bottom-1 left-1/2 -translate-x-1/2 rotate-45'
                : position === 'left'
                ? '-right-1 top-1/2 -translate-y-1/2 rotate-45'
                : '-left-1 top-1/2 -translate-y-1/2 rotate-45'
            }`}
          />

          <div className="relative">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
              {explanation.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-2">
              {explanation.content}
            </p>
            {explanation.technicalDetails && isProMode && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-gray-700">
                <p className="text-xs text-slate-500 dark:text-gray-500 font-mono">
                  {explanation.technicalDetails}
                </p>
              </div>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

