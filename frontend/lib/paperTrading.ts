import { PortfolioResponse } from './api';

export interface PaperTradingPortfolio {
  id: string;
  name: string;
  initialCapital: number;
  currentValue: number;
  tickers: string[];
  weights: Record<string, number>;
  createdAt: string;
  lastUpdated: string;
  portfolioData?: PortfolioResponse;
  isActive: boolean;
}

const INITIAL_CAPITAL = 10000; // $10,000 virtual starting capital

export function getInitialPaperTradingPortfolios(): PaperTradingPortfolio[] {
  return [];
}

export function loadPaperTradingPortfolios(): PaperTradingPortfolio[] {
  try {
    const stored = localStorage.getItem('paperTradingPortfolios');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load paper trading portfolios:', e);
  }
  return getInitialPaperTradingPortfolios();
}

export function savePaperTradingPortfolios(portfolios: PaperTradingPortfolio[]): void {
  try {
    localStorage.setItem('paperTradingPortfolios', JSON.stringify(portfolios));
  } catch (e) {
    console.error('Failed to save paper trading portfolios:', e);
  }
}

export function createPaperTradingPortfolio(
  name: string,
  tickers: string[],
  weights: Record<string, number>,
  portfolioData?: PortfolioResponse
): PaperTradingPortfolio {
  const portfolios = loadPaperTradingPortfolios();
  const newPortfolio: PaperTradingPortfolio = {
    id: `paper_${Date.now()}`,
    name,
    initialCapital: INITIAL_CAPITAL,
    currentValue: INITIAL_CAPITAL, // Will be updated based on actual performance
    tickers,
    weights,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    portfolioData,
    isActive: true
  };

  portfolios.push(newPortfolio);
  savePaperTradingPortfolios(portfolios);
  return newPortfolio;
}

export function updatePaperTradingPortfolio(
  id: string,
  updates: Partial<PaperTradingPortfolio>
): PaperTradingPortfolio | null {
  const portfolios = loadPaperTradingPortfolios();
  const index = portfolios.findIndex(p => p.id === id);
  
  if (index === -1) return null;

  portfolios[index] = {
    ...portfolios[index],
    ...updates,
    lastUpdated: new Date().toISOString()
  };

  savePaperTradingPortfolios(portfolios);
  return portfolios[index];
}

export function deletePaperTradingPortfolio(id: string): void {
  const portfolios = loadPaperTradingPortfolios();
  const filtered = portfolios.filter(p => p.id !== id);
  savePaperTradingPortfolios(filtered);
}

export function calculatePaperTradingValue(
  portfolio: PaperTradingPortfolio,
  currentPortfolioData?: PortfolioResponse
): number {
  if (!currentPortfolioData || !currentPortfolioData.portfolio_returns) {
    return portfolio.initialCapital;
  }

  // Calculate return based on portfolio performance
  const returns = currentPortfolioData.portfolio_returns;
  if (returns.length === 0) return portfolio.initialCapital;

  const totalReturn = (returns[returns.length - 1].value / returns[0].value) - 1;
  return portfolio.initialCapital * (1 + totalReturn);
}

