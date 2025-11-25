import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PortfolioRequest {
  tickers: string[];
  objective: 'sharpe' | 'sortino' | 'calmar';
  portfolio_type: 'long_only' | 'long_short';
  lookback_days?: number;
}

export interface PortfolioResponse {
  weights: Record<string, number>;
  expected_return: number;
  volatility: number;
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  calmar_ratio: number | null;
  max_drawdown: number | null;
  total_leverage: number | null;
}

export const optimizePortfolio = async (
  request: PortfolioRequest
): Promise<PortfolioResponse> => {
  const response = await axios.post<PortfolioResponse>(
    `${API_BASE_URL}/optimize-portfolio`,
    request
  );
  return response.data;
};

export const healthCheck = async (): Promise<{ status: string }> => {
  const response = await axios.get(`${API_BASE_URL}/health`);
  return response.data;
};