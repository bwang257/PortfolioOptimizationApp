import { PortfolioResponse } from './api';

export interface Mistake {
  id: string;
  type: 'over_concentration' | 'high_volatility' | 'poor_diversification' | 'sector_bias';
  severity: 'high' | 'medium' | 'low';
  message: string;
  explanation: string;
  suggestion: string;
}

export function analyzePortfolioForMistakes(portfolioData: PortfolioResponse): Mistake[] {
  const mistakes: Mistake[] = [];
  const weights = portfolioData.weights;
  const riskDecomp = portfolioData.risk_decomposition || {};
  const volatility = portfolioData.volatility || 0;

  // Check for over-concentration (single stock > 30%)
  const maxWeight = Math.max(...Object.values(weights).map(w => Math.abs(w)));
  if (maxWeight > 0.3) {
    const ticker = Object.entries(weights).find(([_, w]) => Math.abs(w) === maxWeight)?.[0];
    mistakes.push({
      id: 'over_concentration',
      type: 'over_concentration',
      severity: maxWeight > 0.5 ? 'high' : 'medium',
      message: `Your portfolio is ${(maxWeight * 100).toFixed(0)}% concentrated in ${ticker}`,
      explanation: `Having more than 30% in a single stock increases your risk. If ${ticker} drops significantly, your entire portfolio will be heavily impacted.`,
      suggestion: `Consider reducing ${ticker} to 20% or less and spreading the allocation across other stocks to reduce risk.`
    });
  }

  // Check for high volatility without corresponding returns
  const expectedReturn = portfolioData.expected_return || 0;
  const sharpeRatio = portfolioData.sharpe_ratio || 0;
  if (volatility > 0.25 && sharpeRatio < 0.5) {
    mistakes.push({
      id: 'high_volatility',
      type: 'high_volatility',
      severity: 'high',
      message: 'High volatility with low risk-adjusted returns',
      explanation: `Your portfolio has ${(volatility * 100).toFixed(0)}% volatility but only a ${sharpeRatio.toFixed(2)} Sharpe ratio. This means you're taking on a lot of risk without getting proportional returns.`,
      suggestion: 'Consider adding more stable, defensive stocks (like consumer staples or utilities) to reduce volatility while maintaining returns.'
    });
  }

  // Check for poor diversification (too few stocks or sector concentration)
  const tickerCount = Object.keys(weights).length;
  if (tickerCount < 5) {
    mistakes.push({
      id: 'poor_diversification',
      type: 'poor_diversification',
      severity: 'medium',
      message: `Only ${tickerCount} stocks in your portfolio`,
      explanation: `A portfolio with fewer than 5 stocks lacks diversification. If one stock performs poorly, it will significantly impact your overall returns.`,
      suggestion: 'Add at least 5-10 stocks from different sectors to improve diversification and reduce risk.'
    });
  }

  // Check for sector bias (if we can detect it - simplified check)
  // In a real implementation, you'd check actual sector classifications
  const techTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'AMD', 'TSLA'];
  const techWeight = Object.entries(weights)
    .filter(([ticker]) => techTickers.includes(ticker))
    .reduce((sum, [_, weight]) => sum + Math.abs(weight), 0);
  
  if (techWeight > 0.6) {
    mistakes.push({
      id: 'sector_bias',
      type: 'sector_bias',
      severity: 'high',
      message: `Your portfolio is ${(techWeight * 100).toFixed(0)}% concentrated in tech stocks`,
      explanation: 'Having more than 60% in a single sector (tech) exposes you to sector-specific risks. If the tech sector crashes, your entire portfolio will suffer.',
      suggestion: 'Diversify across sectors by adding stocks from healthcare, finance, consumer goods, or utilities to balance your portfolio.'
    });
  }

  // Check for high risk contribution from single stock
  const maxRiskContribution = Math.max(...Object.values(riskDecomp).map(r => Math.abs(r)));
  if (maxRiskContribution > 0.4) {
    const ticker = Object.entries(riskDecomp).find(([_, r]) => Math.abs(r) === maxRiskContribution)?.[0];
    mistakes.push({
      id: 'high_risk_contribution',
      type: 'over_concentration',
      severity: 'high',
      message: `${ticker} contributes ${(maxRiskContribution * 100).toFixed(0)}% of your portfolio's risk`,
      explanation: `Even if ${ticker} isn't your largest holding, it's contributing a disproportionate amount of risk to your portfolio.`,
      suggestion: `Consider reducing your position in ${ticker} or adding lower-volatility stocks to balance the risk.`
    });
  }

  return mistakes;
}

