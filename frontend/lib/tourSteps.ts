import { Step } from 'react-joyride';

export function getTourSteps(isProMode: boolean): Step[] {
  const baseSteps: Step[] = [
    {
      target: '[data-tour="optimize-button"]',
      content: 'This is your engine. It uses Nobel Prize-winning math (Modern Portfolio Theory) to find the safest mix of stocks that maximizes returns for your risk level.',
      placement: 'bottom',
      disableBeacon: true
    },
    {
      target: '[data-tour="news-feed"]',
      content: isProMode
        ? 'Drag news articles here to instantly create optimized portfolios. The system will extract tickers and optimize automatically.'
        : 'Drag news articles here to build portfolios with step-by-step guidance. We\'ll help you understand each decision.',
      placement: 'top',
      disableBeacon: true
    },
    {
      target: '[data-tour="why-button"]',
      content: 'Hover over portfolio allocations to see why we made these decisions. Every allocation has a reason based on risk and return analysis.',
      placement: 'left',
      disableBeacon: true
    }
  ];

  if (!isProMode) {
    baseSteps.push({
      target: '[data-tour="progress-tracker"]',
      content: 'Track your learning progress here. Earn badges and maintain streaks as you master portfolio optimization concepts.',
      placement: 'left',
      disableBeacon: true
    });
  }

  return baseSteps;
}

