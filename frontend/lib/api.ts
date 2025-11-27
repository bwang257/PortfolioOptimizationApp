export interface PortfolioRequest {
  tickers: string[];
  objective: string;
  portfolio_type: string;
  lookback_days: number;
  esg_weight?: number;
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
  price_history?: Record<string, Array<{ date: string; price: number }>>;
  portfolio_returns?: Array<{ date: string; value: number }>;
  efficient_frontier?: Array<{ risk: number; return: number; sharpe: number }>;
  rolling_metrics?: {
    sharpe_30?: Array<{ date: string; value: number }>;
    sharpe_60?: Array<{ date: string; value: number }>;
    sharpe_90?: Array<{ date: string; value: number }>;
    volatility_30?: Array<{ date: string; value: number }>;
    volatility_60?: Array<{ date: string; value: number }>;
    volatility_90?: Array<{ date: string; value: number }>;
  };
  correlation_matrix?: Record<string, Record<string, number>>;
  risk_decomposition?: Record<string, number>;
  esg_weight?: number | null;
  portfolio_esg_score?: number | null;
  ticker_esg_scores?: Record<string, number>;
}

export interface TickerInfo {
  symbol: string;
  name: string;
}

export interface TickerSearchResponse {
  results: TickerInfo[];
}

export async function optimizePortfolio(params: PortfolioRequest): Promise<PortfolioResponse> {
  const response = await fetch('http://127.0.0.1:8000/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Optimization failed');
  }
  
  return response.json();
}

export async function searchTickers(query: string): Promise<TickerInfo[]> {
  const response = await fetch(`http://127.0.0.1:8000/search/tickers?q=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Search failed');
  }
  
  const data: TickerSearchResponse = await response.json();
  return data.results;
}
