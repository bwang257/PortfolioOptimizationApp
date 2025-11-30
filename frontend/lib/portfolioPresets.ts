export interface PortfolioPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  tickers: string[];
  suggested_objective: 'sharpe' | 'sortino' | 'calmar' | 'min_variance';
  suggested_esg_weight?: number;
}

// Import presets from JSON (in production, this would be fetched from API)
// For now, we'll define them here to match the backend structure
export const portfolioPresets: PortfolioPreset[] = [
  {
    id: "tech-giants",
    name: "Tech Giants",
    description: "Leading technology companies with strong market positions",
    category: "Tech",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "big-tech",
    name: "Big Tech",
    description: "The largest technology companies by market cap",
    category: "Tech",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "META"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "semiconductors",
    name: "Semiconductors",
    description: "Leading semiconductor and chip manufacturers",
    category: "Tech",
    tickers: ["NVDA", "AMD", "INTC", "TSM", "AVGO"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "major-banks",
    name: "Major Banks",
    description: "Top US banking institutions",
    category: "Finance",
    tickers: ["JPM", "BAC", "WFC", "C", "GS", "MS"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "financial-services",
    name: "Financial Services",
    description: "Diversified financial services companies",
    category: "Finance",
    tickers: ["JPM", "BAC", "GS", "MS", "BLK"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "healthcare-leaders",
    name: "Healthcare Leaders",
    description: "Top pharmaceutical and healthcare companies",
    category: "Healthcare",
    tickers: ["JNJ", "PFE", "UNH", "ABBV", "TMO", "DHR"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "pharma-giants",
    name: "Pharma Giants",
    description: "Major pharmaceutical companies",
    category: "Healthcare",
    tickers: ["JNJ", "PFE", "ABBV", "MRK", "LLY"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "energy-majors",
    name: "Energy Majors",
    description: "Major oil and gas companies",
    category: "Energy",
    tickers: ["XOM", "CVX", "COP", "SLB", "EOG"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    description: "Clean energy and renewable power companies. Suggested: Sharpe ratio objective with 30% ESG weight.",
    category: "Energy",
    tickers: ["NEE", "ENPH", "FSLR", "SEDG", "RUN"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.3
  },
  {
    id: "consumer-staples",
    name: "Consumer Staples",
    description: "Stable consumer goods companies",
    category: "Consumer",
    tickers: ["PG", "KO", "PEP", "WMT", "COST"],
    suggested_objective: "min_variance",
    suggested_esg_weight: 0.0
  },
  {
    id: "consumer-discretionary",
    name: "Consumer Discretionary",
    description: "Consumer discretionary spending companies",
    category: "Consumer",
    tickers: ["AMZN", "TSLA", "NKE", "SBUX", "HD"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "major-etfs",
    name: "Major ETFs",
    description: "Popular broad market exchange-traded funds",
    category: "ETFs",
    tickers: ["SPY", "QQQ", "IWM", "DIA", "VTI"],
    suggested_objective: "min_variance",
    suggested_esg_weight: 0.0
  },
  {
    id: "sector-etfs",
    name: "Sector ETFs",
    description: "Diversified sector-specific ETFs",
    category: "ETFs",
    tickers: ["XLF", "XLK", "XLV", "XLE", "XLI"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "balanced-growth",
    name: "Balanced Growth",
    description: "Diversified portfolio across multiple sectors for growth",
    category: "Diversified",
    tickers: ["AAPL", "JPM", "JNJ", "XOM", "PG", "MSFT"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "dividend-focus",
    name: "Dividend Focus",
    description: "High dividend yield stocks for income",
    category: "Diversified",
    tickers: ["JNJ", "PG", "KO", "PEP", "XOM", "CVX"],
    suggested_objective: "sortino",
    suggested_esg_weight: 0.0
  },
  {
    id: "esg-leaders",
    name: "ESG Leaders",
    description: "Companies with strong ESG ratings. Suggested: Sharpe ratio objective with 50% ESG weight.",
    category: "ESG-focused",
    tickers: ["MSFT", "NVDA", "AAPL", "GOOGL", "NEE"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.5
  },
  {
    id: "sustainable-tech",
    name: "Sustainable Tech",
    description: "Technology companies with strong sustainability practices. Suggested: Sharpe ratio objective with 40% ESG weight.",
    category: "ESG-focused",
    tickers: ["MSFT", "GOOGL", "AAPL", "NVDA", "ADBE"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.4
  },
  {
    id: "defensive-portfolio",
    name: "Defensive Portfolio",
    description: "Low volatility stocks for capital preservation",
    category: "Diversified",
    tickers: ["JNJ", "PG", "KO", "WMT", "XOM", "CVX"],
    suggested_objective: "min_variance",
    suggested_esg_weight: 0.0
  },
  {
    id: "growth-stocks",
    name: "Growth Stocks",
    description: "High growth potential companies",
    category: "Diversified",
    tickers: ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.0
  },
  {
    id: "value-investing",
    name: "Value Investing",
    description: "Undervalued stocks with strong fundamentals",
    category: "Diversified",
    tickers: ["BRK.B", "JPM", "BAC", "WFC", "XOM", "CVX"],
    suggested_objective: "sortino",
    suggested_esg_weight: 0.0
  },
  {
    id: "real-estate-reits",
    name: "Real Estate REITs",
    description: "Real estate investment trusts for income and diversification",
    category: "Diversified",
    tickers: ["VNQ", "AMT", "PLD", "EQIX", "PSA", "WELL"],
    suggested_objective: "min_variance",
    suggested_esg_weight: 0.0
  },
  {
    id: "clean-energy",
    name: "Clean Energy",
    description: "Renewable energy and clean technology companies. Suggested: Sharpe ratio objective with 35% ESG weight.",
    category: "ESG-focused",
    tickers: ["NEE", "ENPH", "FSLR", "SEDG", "RUN", "PLUG"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.35
  },
  {
    id: "esg-tech-leaders",
    name: "ESG Tech Leaders",
    description: "Technology companies with strong ESG ratings and sustainability practices",
    category: "ESG-focused",
    tickers: ["MSFT", "GOOGL", "AAPL", "NVDA", "ADBE"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.4
  },
  {
    id: "sustainable-finance",
    name: "Sustainable Finance",
    description: "Financial institutions with strong ESG commitments and sustainable practices",
    category: "ESG-focused",
    tickers: ["BLK", "SCHW", "COIN"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.35
  },
  {
    id: "green-infrastructure",
    name: "Green Infrastructure",
    description: "Utilities and infrastructure companies focused on renewable energy and sustainability",
    category: "ESG-focused",
    tickers: ["NEE", "AEP", "DUK", "SO"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.45
  },
  {
    id: "esg-healthcare",
    name: "ESG Healthcare",
    description: "Healthcare companies with strong ESG ratings and ethical practices",
    category: "ESG-focused",
    tickers: ["UNH", "CVS", "CI"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.3
  },
  {
    id: "climate-solutions",
    name: "Climate Solutions",
    description: "Companies focused on climate change solutions and environmental sustainability",
    category: "ESG-focused",
    tickers: ["ICLN", "QCLN", "PBW"],
    suggested_objective: "sharpe",
    suggested_esg_weight: 0.5
  }
];

export const categories = [
  "All",
  "Tech",
  "Finance",
  "Healthcare",
  "Energy",
  "Consumer",
  "ETFs",
  "Diversified",
  "ESG-focused"
];

export function getPresetsByCategory(category: string): PortfolioPreset[] {
  if (category === "All") {
    return portfolioPresets;
  }
  return portfolioPresets.filter(preset => preset.category === category);
}

export function searchPresets(query: string): PortfolioPreset[] {
  const lowerQuery = query.toLowerCase();
  return portfolioPresets.filter(preset =>
    preset.name.toLowerCase().includes(lowerQuery) ||
    preset.description.toLowerCase().includes(lowerQuery) ||
    preset.category.toLowerCase().includes(lowerQuery) ||
    preset.tickers.some(ticker => ticker.toLowerCase().includes(lowerQuery))
  );
}

export function getPresetById(id: string): PortfolioPreset | undefined {
  return portfolioPresets.find(preset => preset.id === id);
}

