import { PortfolioResponse } from './api';

export interface Explanation {
  title: string;
  content: string;
  technicalDetails?: string;
}

/**
 * Generate educational explanations based on portfolio metrics
 */
export function generateExplanation(
  ticker: string,
  weight: number,
  portfolioData: PortfolioResponse,
  isProMode: boolean
): Explanation {
  const riskDecomp = portfolioData.risk_decomposition || {};
  const tickerRiskContribution = riskDecomp[ticker] || 0;
  const totalVolatility = portfolioData.volatility || 0;
  const tickerVolatility = Math.abs(tickerRiskContribution) / (weight || 0.01) * 100;

  // Check if weight is capped (likely if it's a round number like 0.2, 0.25, etc.)
  const isCapped = weight === 0.2 || weight === 0.25 || weight === 0.3 || weight === 0.15;

  if (isCapped && tickerRiskContribution > 0.3) {
    // High risk contribution - explain why it's capped
    const riskPercentage = (tickerRiskContribution * 100).toFixed(1);
    
    if (isProMode) {
      return {
        title: `Why ${ticker} is capped at ${(weight * 100).toFixed(0)}%`,
        content: `${ticker} contributes ${riskPercentage}% of your portfolio's total volatility despite being only ${(weight * 100).toFixed(0)}% of the allocation. This concentration risk is mitigated by capping the position.`,
        technicalDetails: `Risk Contribution: ${riskPercentage}% | Portfolio Volatility: ${(totalVolatility * 100).toFixed(2)}% | Ticker Volatility: ${tickerVolatility.toFixed(2)}%`
      };
    } else {
      return {
        title: `Why we limited ${ticker}`,
        content: `Even though ${ticker} is only ${(weight * 100).toFixed(0)}% of your portfolio, it's responsible for ${riskPercentage}% of your risk. We capped it to protect you if this stock or sector crashes.`,
      };
    }
  }

  if (tickerRiskContribution > 0.4) {
    // Very high risk concentration
    if (isProMode) {
      return {
        title: `High Risk Concentration: ${ticker}`,
        content: `${ticker} accounts for ${(tickerRiskContribution * 100).toFixed(1)}% of portfolio risk. Consider diversifying to reduce concentration risk.`,
        technicalDetails: `Risk Contribution: ${(tickerRiskContribution * 100).toFixed(1)}% | Weight: ${(weight * 100).toFixed(1)}%`
      };
    } else {
      return {
        title: `This stock adds a lot of risk`,
        content: `${ticker} makes up ${(tickerRiskContribution * 100).toFixed(0)}% of your portfolio's risk. That's a lot! Consider spreading your money across more stocks to be safer.`,
      };
    }
  }

  if (weight > 0.3) {
    // High allocation
    if (isProMode) {
      return {
        title: `Large Position: ${ticker}`,
        content: `${ticker} represents ${(weight * 100).toFixed(0)}% of your portfolio. This is a significant concentration that increases single-stock risk.`,
        technicalDetails: `Weight: ${(weight * 100).toFixed(1)}% | Risk Contribution: ${(tickerRiskContribution * 100).toFixed(1)}%`
      };
    } else {
      return {
        title: `Big position in ${ticker}`,
        content: `You have ${(weight * 100).toFixed(0)}% of your portfolio in ${ticker}. That's a lot in one stock! If it goes down, it will affect your portfolio a lot.`,
      };
    }
  }

  // Default explanation
  if (isProMode) {
    return {
      title: `${ticker} Allocation`,
      content: `${ticker} is allocated ${(weight * 100).toFixed(1)}% of the portfolio, contributing ${(tickerRiskContribution * 100).toFixed(1)}% to total risk.`,
      technicalDetails: `Weight: ${(weight * 100).toFixed(1)}% | Risk: ${(tickerRiskContribution * 100).toFixed(1)}%`
    };
  } else {
    return {
      title: `About ${ticker}`,
      content: `This stock makes up ${(weight * 100).toFixed(0)}% of your portfolio. The optimizer chose this amount to balance risk and return.`,
    };
  }
}

/**
 * Generate explanation for portfolio-level metrics
 */
export function generatePortfolioExplanation(
  metric: string,
  value: number,
  portfolioData: PortfolioResponse,
  isProMode: boolean
): Explanation {
  switch (metric) {
    case 'volatility':
      if (isProMode) {
        return {
          title: 'Portfolio Volatility',
          content: `Annualized volatility of ${(value * 100).toFixed(2)}%. This measures how much your portfolio's value fluctuates. Lower is generally better for risk-averse investors.`,
          technicalDetails: `Calculated as standard deviation of returns × √252`
        };
      } else {
        return {
          title: 'How much your portfolio moves',
          content: `Your portfolio moves up and down by about ${(value * 100).toFixed(0)}% per year on average. Lower numbers mean less risk.`,
        };
      }

    case 'sharpe_ratio':
      if (isProMode) {
        return {
          title: 'Sharpe Ratio',
          content: `Sharpe ratio of ${value.toFixed(2)}. This measures risk-adjusted returns. Higher values indicate better risk-adjusted performance.`,
          technicalDetails: `(Expected Return - Risk-Free Rate) / Volatility`
        };
      } else {
        return {
          title: 'Risk-adjusted performance score',
          content: `Your portfolio scores ${value.toFixed(1)} on risk-adjusted returns. Higher is better - it means you're getting good returns for the risk you're taking.`,
        };
      }

    case 'max_drawdown':
      if (isProMode) {
        return {
          title: 'Maximum Drawdown',
          content: `Maximum drawdown of ${(Math.abs(value) * 100).toFixed(2)}%. This is the largest peak-to-trough decline during the backtest period.`,
          technicalDetails: `Peak value - Trough value / Peak value`
        };
      } else {
        return {
          title: 'Worst drop',
          content: `At its worst point, your portfolio dropped ${(Math.abs(value) * 100).toFixed(0)}% from its highest value. This shows how much you could lose in a bad market.`,
        };
      }

    default:
      return {
        title: metric,
        content: `This metric is ${value.toFixed(2)}.`,
      };
  }
}

