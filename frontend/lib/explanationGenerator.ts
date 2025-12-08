import { PortfolioResponse } from './api';
import { generateExplanation, generatePortfolioExplanation, Explanation } from './educationalContent';

/**
 * Main function to generate explanations for portfolio elements
 */
export function explainPortfolioElement(
  element: 'ticker' | 'metric',
  identifier: string,
  value: number,
  portfolioData: PortfolioResponse,
  isProMode: boolean
): Explanation {
  if (element === 'ticker') {
    const weight = portfolioData.weights[identifier] || 0;
    return generateExplanation(identifier, weight, portfolioData, isProMode);
  } else {
    return generatePortfolioExplanation(identifier, value, portfolioData, isProMode);
  }
}

/**
 * Check if a ticker weight is likely capped
 */
export function isWeightCapped(weight: number): boolean {
  // Common cap values (20%, 25%, 30%, 15%)
  const capValues = [0.15, 0.2, 0.25, 0.3, 0.1, 0.05];
  return capValues.some(cap => Math.abs(weight - cap) < 0.01);
}

