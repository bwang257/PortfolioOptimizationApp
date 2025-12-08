export interface NewsArticle {
  id: string;
  headline: string;
  headlineSimple: string; // Narrative-driven for Simple mode
  headlinePro: string; // Data-driven for Pro mode
  content: string;
  source: string;
  date: string;
  tickers: string[]; // Tickers mentioned in the article
  category: 'tech' | 'finance' | 'market' | 'economy' | 'sector';
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    headline: 'Tech stocks surge as AI demand drives semiconductor rally',
    headlineSimple: 'Tech stocks are up today!',
    headlinePro: 'Tech Sector: +3.2% | AI Demand Surge | Semiconductors Lead',
    content: 'NVIDIA (NVDA) and AMD (AMD) saw significant gains today as artificial intelligence demand continues to drive semiconductor sales. The tech sector overall posted strong gains, with major tech companies like Microsoft (MSFT) and Apple (AAPL) also seeing positive momentum.',
    source: 'Financial Times',
    date: new Date().toISOString(),
    tickers: ['NVDA', 'AMD', 'MSFT', 'AAPL'],
    category: 'tech'
  },
  {
    id: '2',
    headline: 'Federal Reserve signals potential rate cut in next meeting',
    headlineSimple: 'Interest rates might go down soon',
    headlinePro: 'Fed Rate Decision: -25bps Expected | Next Meeting: 6 Weeks',
    content: 'The Federal Reserve indicated it may cut interest rates by 25 basis points in its next meeting. Financial stocks including JPMorgan (JPM) and Bank of America (BAC) reacted positively to the news, while bond yields declined.',
    source: 'Wall Street Journal',
    date: new Date(Date.now() - 86400000).toISOString(),
    tickers: ['JPM', 'BAC'],
    category: 'finance'
  },
  {
    id: '3',
    headline: 'Healthcare sector shows resilience amid market volatility',
    headlineSimple: 'Healthcare stocks stay strong',
    headlinePro: 'Healthcare Sector: +1.8% | Volatility: 12.3% | Defensive Play',
    content: 'Healthcare stocks including Johnson & Johnson (JNJ) and Pfizer (PFE) demonstrated resilience as investors seek defensive positions. UnitedHealth (UNH) also posted gains.',
    source: 'Bloomberg',
    date: new Date(Date.now() - 172800000).toISOString(),
    tickers: ['JNJ', 'PFE', 'UNH'],
    category: 'sector'
  },
  {
    id: '4',
    headline: 'Energy sector rallies on supply concerns',
    headlineSimple: 'Oil and gas stocks are rising',
    headlinePro: 'Energy Sector: +2.5% | Supply Constraints | WTI: $78.50',
    content: 'Energy stocks including Exxon Mobil (XOM) and Chevron (CVX) rallied as supply concerns drive oil prices higher. The sector saw broad gains across exploration and production companies.',
    source: 'Reuters',
    date: new Date(Date.now() - 259200000).toISOString(),
    tickers: ['XOM', 'CVX'],
    category: 'sector'
  },
  {
    id: '5',
    headline: 'Consumer staples outperform in uncertain market',
    headlineSimple: 'Everyday products stocks doing well',
    headlinePro: 'Consumer Staples: +1.2% | Beta: 0.65 | Defensive Rotation',
    content: 'Consumer staples companies like Procter & Gamble (PG) and Coca-Cola (KO) outperformed as investors rotate into defensive sectors. Walmart (WMT) also saw gains.',
    source: 'MarketWatch',
    date: new Date(Date.now() - 345600000).toISOString(),
    tickers: ['PG', 'KO', 'WMT'],
    category: 'sector'
  },
  {
    id: '6',
    headline: 'Cloud computing giants report strong earnings',
    headlineSimple: 'Big tech companies made lots of money',
    headlinePro: 'Cloud Revenue: +18% YoY | MSFT, GOOGL, AMZN Beat Estimates',
    content: 'Microsoft (MSFT), Google (GOOGL), and Amazon (AMZN) all reported strong cloud computing revenue growth, driving their stock prices higher. The cloud infrastructure market continues to expand rapidly.',
    source: 'TechCrunch',
    date: new Date(Date.now() - 432000000).toISOString(),
    tickers: ['MSFT', 'GOOGL', 'AMZN'],
    category: 'tech'
  }
];

