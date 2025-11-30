'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  calmar_ratio: number | null;
  max_drawdown: number | null;
  total_leverage: number | null;
}

const metricTooltips: Record<string, string> = {
  'Expected Return': 'Annualized expected return of the portfolio based on historical data',
  'Volatility': 'Annualized standard deviation of returns (risk measure). Lower is generally better',
  'Sharpe Ratio': 'Risk-adjusted return measure. Higher is better. Compares excess return to volatility',
  'Sortino Ratio': 'Risk-adjusted return focusing on downside risk only. Higher is better',
  'Calmar Ratio': 'Return per unit of maximum drawdown. Higher is better',
  'Max Drawdown': 'Largest peak-to-trough decline in portfolio value. Lower (less negative) is better',
  'Total Leverage': 'Sum of absolute position weights. >1.0 indicates leveraged positions'
};

export default function MetricsTable({
  expected_return,
  volatility,
  sharpe_ratio,
  sortino_ratio,
  calmar_ratio,
  max_drawdown,
  total_leverage
}: Props) {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [clickedTooltip, setClickedTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; side: 'left' | 'right' | 'top' | 'bottom' } | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateTooltipPosition = (metricLabel: string) => {
    const button = buttonRefs.current[metricLabel];
    if (!button) return;
    
    // Use getBoundingClientRect to get position relative to viewport
    // This ensures correct positioning regardless of scroll position or parent containers
    const rect = button.getBoundingClientRect();
    const tooltipWidth = 256; // w-64 = 256px
    const gap = 8; // Small gap between icon and tooltip
    
    // Check available space in viewport
    const spaceOnLeft = rect.left;
    const spaceOnRight = window.innerWidth - rect.right;
    
    let left: number;
    let top: number;
    let side: 'left' | 'right' | 'top' | 'bottom';
    
    // Always prefer positioning to the LEFT of the icon (as requested)
    if (spaceOnLeft >= tooltipWidth + gap) {
      // Position to the left of icon, vertically centered
      left = rect.left - tooltipWidth - gap;
      top = rect.top + rect.height / 2;
      side = 'left';
    } else if (spaceOnRight >= tooltipWidth + gap) {
      // Fallback: position to the right if not enough space on left
      left = rect.right + gap;
      top = rect.top + rect.height / 2;
      side = 'right';
    } else {
      // Not enough horizontal space, position below icon
      left = Math.max(gap, Math.min(rect.left, window.innerWidth - tooltipWidth - gap));
      top = rect.bottom + gap;
      side = 'bottom';
    }
    
    setTooltipPosition({
      top,
      left,
      side
    });
  };

  // Update tooltip position on scroll/resize
  useEffect(() => {
    if (openTooltip || clickedTooltip) {
      const metricLabel = openTooltip || clickedTooltip;
      if (metricLabel) {
        updateTooltipPosition(metricLabel);
      }
    }
    
    const handleScroll = () => {
      if (openTooltip || clickedTooltip) {
        const metricLabel = openTooltip || clickedTooltip;
        if (metricLabel) {
          updateTooltipPosition(metricLabel);
        }
      }
    };
    
    const handleResize = () => {
      if (openTooltip || clickedTooltip) {
        const metricLabel = openTooltip || clickedTooltip;
        if (metricLabel) {
          updateTooltipPosition(metricLabel);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [openTooltip, clickedTooltip]);

  const metrics = [
    { label: 'Expected Return', value: `${(expected_return * 100).toFixed(2)}%`, color: 'blue' },
    { label: 'Volatility', value: `${(volatility * 100).toFixed(2)}%`, color: 'green' },
    { label: 'Sharpe Ratio', value: sharpe_ratio?.toFixed(2) || 'N/A', color: 'purple' },
    { label: 'Sortino Ratio', value: sortino_ratio?.toFixed(2) || 'N/A', color: 'indigo' },
    { label: 'Calmar Ratio', value: calmar_ratio?.toFixed(2) || 'N/A', color: 'pink' },
    { label: 'Max Drawdown', value: `${((max_drawdown || 0) * 100).toFixed(2)}%`, color: 'red' },
  ];

  if (total_leverage) {
    metrics.push({ label: 'Total Leverage', value: total_leverage.toFixed(2), color: 'yellow' });
  }

  // Render tooltip in a portal to ensure it's always at the document body level
  const tooltipContent = (openTooltip || clickedTooltip) && tooltipPosition ? (
    <div 
      className="w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg opacity-100 transition-opacity duration-200 pointer-events-auto shadow-lg border border-gray-700 dark:border-gray-600"
      style={{
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        transform: tooltipPosition.side === 'left' || tooltipPosition.side === 'right' 
          ? 'translateY(-50%)' 
          : tooltipPosition.side === 'top'
          ? 'translate(-50%, -100%)'
          : 'translateX(-50%)',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      {metricTooltips[openTooltip || clickedTooltip || '']}
    </div>
  ) : null;

  return (
    <>
      {typeof window !== 'undefined' && tooltipContent && createPortal(tooltipContent, document.body)}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
        <div 
          key={metric.label} 
          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden transition-smooth hover-lift cursor-default relative group"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
              {metric.label}
            </p>
            {metricTooltips[metric.label] && (
              <div className="ml-2 flex-shrink-0">
                <button
                  ref={(el) => { buttonRefs.current[metric.label] = el; }}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTooltipPosition(metric.label);
                    if (clickedTooltip === metric.label) {
                      setClickedTooltip(null);
                      setOpenTooltip(null);
                      setTooltipPosition(null);
                    } else {
                      setClickedTooltip(metric.label);
                      setOpenTooltip(metric.label);
                    }
                  }}
                  onMouseEnter={() => {
                    if (clickedTooltip !== metric.label) {
                      updateTooltipPosition(metric.label);
                      setOpenTooltip(metric.label);
                    }
                  }}
                  onMouseLeave={() => {
                    if (clickedTooltip !== metric.label) {
                      setOpenTooltip(null);
                      setTooltipPosition(null);
                    }
                  }}
                  className="focus:outline-none"
                  aria-label={`Show definition for ${metric.label}`}
                >
                  <svg 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 active:text-blue-700 dark:active:text-blue-300 cursor-pointer transition-all duration-200 ${(openTooltip === metric.label || clickedTooltip === metric.label) ? 'text-blue-600 dark:text-blue-400 scale-110' : ''}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {metric.value}
          </p>
        </div>
      ))}
      </div>
    </>
  );
}