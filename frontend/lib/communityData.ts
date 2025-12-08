export interface CommunityInsight {
  id: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  approach: string;
  tickersAdded: string[];
  reasoning: string;
  outcome: 'positive' | 'neutral' | 'negative';
}

export const mockCommunityInsights: CommunityInsight[] = [
  {
    id: '1',
    userLevel: 'beginner',
    approach: 'Added 3 defensive stocks (MSFT, JNJ, PG) to balance tech-heavy portfolio',
    tickersAdded: ['MSFT', 'JNJ', 'PG'],
    reasoning: 'Wanted to reduce risk by diversifying beyond tech stocks',
    outcome: 'positive'
  },
  {
    id: '2',
    userLevel: 'beginner',
    approach: 'Started with 5 stocks, then added 3 more for better diversification',
    tickersAdded: ['AAPL', 'MSFT', 'GOOGL'],
    reasoning: 'Learned that more stocks = less risk',
    outcome: 'positive'
  },
  {
    id: '3',
    userLevel: 'intermediate',
    approach: 'Used minimum variance objective to reduce portfolio volatility',
    tickersAdded: ['JNJ', 'PG', 'KO', 'WMT'],
    reasoning: 'Focused on stability over high returns',
    outcome: 'positive'
  },
  {
    id: '4',
    userLevel: 'beginner',
    approach: 'Added healthcare stocks after reading news about sector resilience',
    tickersAdded: ['JNJ', 'PFE', 'UNH'],
    reasoning: 'Healthcare seemed safer during market uncertainty',
    outcome: 'neutral'
  },
  {
    id: '5',
    userLevel: 'advanced',
    approach: 'Created long/short portfolio with 30% leverage cap',
    tickersAdded: ['NVDA', 'AMD'],
    reasoning: 'Used short positions to hedge tech exposure',
    outcome: 'positive'
  }
];

export function getCommunityInsightsForArticle(articleTickers: string[], userLevel?: string): CommunityInsight[] {
  // Filter insights that are relevant to the article's tickers
  const relevant = mockCommunityInsights.filter(insight => {
    return insight.tickersAdded.some(ticker => articleTickers.includes(ticker));
  });

  // Filter by user level if provided
  if (userLevel) {
    return relevant.filter(insight => insight.userLevel === userLevel);
  }

  return relevant.slice(0, 3); // Return top 3
}

