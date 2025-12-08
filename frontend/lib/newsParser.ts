import { NewsArticle } from './mockNewsData';

/**
 * Extract ticker symbols from article content
 * This is a simple parser - in production, you'd use NLP or more sophisticated parsing
 */
export function extractTickersFromArticle(article: NewsArticle): string[] {
  return article.tickers || [];
}

/**
 * Get safe/defensive stocks to balance risk
 * These are typically lower volatility, established companies
 */
export function getSafeStocksForBalance(tickers: string[]): string[] {
  const safeStocks = ['MSFT', 'AAPL', 'JNJ', 'PG', 'KO', 'WMT', 'XOM'];
  
  // Filter out tickers that are already in the list
  const availableSafeStocks = safeStocks.filter(t => !tickers.includes(t));
  
  // Return top 3 safe stocks
  return availableSafeStocks.slice(0, 3);
}

/**
 * Analyze article and suggest portfolio additions
 */
export function analyzeArticleForPortfolio(article: NewsArticle): {
  mentionedTickers: string[];
  suggestedAdditions: string[];
  riskLevel: 'high' | 'medium' | 'low';
} {
  const mentionedTickers = extractTickersFromArticle(article);
  const suggestedAdditions = getSafeStocksForBalance(mentionedTickers);
  
  // Determine risk level based on category and tickers
  let riskLevel: 'high' | 'medium' | 'low' = 'medium';
  if (article.category === 'tech' && mentionedTickers.length > 0) {
    riskLevel = 'high';
  } else if (article.category === 'sector' && mentionedTickers.some(t => ['JNJ', 'PG', 'KO'].includes(t))) {
    riskLevel = 'low';
  }
  
  return {
    mentionedTickers,
    suggestedAdditions,
    riskLevel
  };
}

