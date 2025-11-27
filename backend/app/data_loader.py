import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DataLoader:
    """Fetches and cleans historical price data for portfolio optimization."""
    
    def __init__(self, lookback_days: int = 252):
        """
        Initialize data loader.
        
        Args:
            lookback_days: Number of trading days to fetch (default: 252 = 1 year)
        """
        self.lookback_days = lookback_days
    
    def fetch_prices(self, tickers: List[str]) -> pd.DataFrame:
        """
        Fetch historical closing prices for given tickers.
        
        Args:
            tickers: List of stock ticker symbols
            
        Returns:
            DataFrame with columns as tickers and index as dates
            
        Raises:
            ValueError: If no valid data is retrieved
        """
        if not tickers:
            raise ValueError("Tickers list cannot be empty")
        
        # Add buffer for rolling metrics (need at least 90 days extra for 90-day rolling windows)
        # Use max of 90 days or 1.5x lookback_days to ensure enough data
        buffer_days = max(90, int(self.lookback_days * 0.5))
        total_days_needed = self.lookback_days + buffer_days
        
        # Calculate start date - fetch more data than needed
        end_date = datetime.now()
        start_date = end_date - timedelta(days=total_days_needed * 2)
        
        # Fetch data
        try:
            data = yf.download(
                tickers,
                start=start_date.strftime("%Y-%m-%d"),
                end=end_date.strftime("%Y-%m-%d"),
                progress=False
            )
        except Exception as e:
            raise ValueError(f"Failed to fetch data: {str(e)}")
        
        # Handle single ticker case
        if len(tickers) == 1:
            if 'Close' in data.columns:
                prices = pd.DataFrame(data['Close'])
                prices.columns = tickers
            else:
                prices = pd.DataFrame(data)
                prices.columns = tickers
        else:
            if 'Close' in data.columns:
                prices = data['Close']
            else:
                prices = data
        
        # Clean data
        prices = prices.ffill().bfill()
        
        # Remove tickers with insufficient data
        min_required_days = total_days_needed * 0.8
        valid_tickers = []
        for ticker in tickers:
            if ticker in prices.columns:
                non_null_count = prices[ticker].notna().sum()
                if non_null_count >= min_required_days:
                    valid_tickers.append(ticker)
        
        if not valid_tickers:
            raise ValueError("No tickers with sufficient historical data")
        
        prices = prices[valid_tickers]
        # Return all available data (not just lookback_days) so rolling metrics have enough data
        # The optimization will use the last lookback_days, but rolling metrics need the full range
        prices = prices.dropna()
        
        if len(prices) < total_days_needed:
            raise ValueError(f"Insufficient data: only {len(prices)} days available, need at least {total_days_needed}")
        
        return prices
    
    def compute_returns(self, prices: pd.DataFrame) -> pd.DataFrame:
        """Compute daily returns from prices"""
        returns = prices.pct_change().dropna()
        return returns
    
    @staticmethod
    def fetch_esg_scores(tickers: List[str]) -> Dict[str, float]:
        """
        Fetch ESG scores for given tickers using yfinance.
        Tries multiple methods to retrieve ESG data.
        
        Args:
            tickers: List of stock ticker symbols
            
        Returns:
            Dictionary mapping ticker to ESG score (lower is better)
            Missing or unavailable data gets a neutral score based on available scores
        """
        import time
        esg_scores: Dict[str, float] = {}
        available_scores = []
        
        for i, ticker in enumerate(tickers):
            # Add small delay to avoid rate limiting
            if i > 0:
                time.sleep(0.1)
            
            try:
                stock = yf.Ticker(ticker)
                total_esg = None
                
                # Method 1: Try accessing from info dict (most reliable)
                try:
                    info = stock.info
                    if info and isinstance(info, dict):
                        total_esg = info.get('totalEsg')
                        if total_esg is not None:
                            try:
                                total_esg = float(total_esg)
                                if not pd.isna(total_esg) and total_esg > 0:
                                    esg_scores[ticker] = total_esg
                                    available_scores.append(total_esg)
                                    logger.info(f"Fetched ESG score for {ticker} from info: {total_esg}")
                                    continue
                            except (ValueError, TypeError):
                                pass
                except Exception as e:
                    logger.debug(f"Method 1 (info) failed for {ticker}: {str(e)}")
                
                # Method 2: Try sustainability DataFrame
                try:
                    sustainability = stock.sustainability
                    if sustainability is not None and not sustainability.empty:
                        # Try different ways to access totalEsg
                        if 'totalEsg' in sustainability.index:
                            if len(sustainability.columns) > 0:
                                total_esg = sustainability.loc['totalEsg', sustainability.columns[0]]
                            else:
                                # Try accessing as a Series
                                if hasattr(sustainability, 'loc'):
                                    try:
                                        total_esg = sustainability.loc['totalEsg']
                                        if isinstance(total_esg, pd.Series):
                                            total_esg = total_esg.iloc[0] if len(total_esg) > 0 else None
                                    except:
                                        pass
                        
                        if total_esg is not None:
                            try:
                                total_esg = float(total_esg)
                                if not pd.isna(total_esg) and total_esg > 0:
                                    esg_scores[ticker] = total_esg
                                    available_scores.append(total_esg)
                                    logger.info(f"Fetched ESG score for {ticker} from sustainability: {total_esg}")
                                    continue
                            except (ValueError, TypeError):
                                pass
                except Exception as e:
                    logger.debug(f"Method 2 (sustainability) failed for {ticker}: {str(e)}")
                
                # Method 3: Try get_sustainability if available
                try:
                    if hasattr(stock, 'get_sustainability'):
                        sustainability_data = stock.get_sustainability()
                        if sustainability_data is not None:
                            if isinstance(sustainability_data, dict) and 'totalEsg' in sustainability_data:
                                total_esg = sustainability_data['totalEsg']
                            elif isinstance(sustainability_data, pd.DataFrame) and 'totalEsg' in sustainability_data.index:
                                total_esg = sustainability_data.loc['totalEsg'].iloc[0] if len(sustainability_data) > 0 else None
                            
                            if total_esg is not None:
                                try:
                                    total_esg = float(total_esg)
                                    if not pd.isna(total_esg) and total_esg > 0:
                                        esg_scores[ticker] = total_esg
                                        available_scores.append(total_esg)
                                        logger.info(f"Fetched ESG score for {ticker} from get_sustainability: {total_esg}")
                                        continue
                                except (ValueError, TypeError):
                                    pass
                except Exception as e:
                    logger.debug(f"Method 3 (get_sustainability) failed for {ticker}: {str(e)}")
                
                # If all methods failed, log warning
                logger.warning(f"ESG data not available for {ticker} after trying all methods")
                
            except Exception as e:
                logger.warning(f"Error fetching ESG data for {ticker}: {str(e)}")
        
        # Calculate neutral score (average of available scores, or 30.0 if none available)
        # Use 30.0 as default since most ESG scores range from 0-50, with 30 being a reasonable neutral
        if available_scores:
            neutral_score = float(np.mean(available_scores))
            logger.info(f"Calculated neutral ESG score from {len(available_scores)} available scores: {neutral_score:.2f}")
        else:
            neutral_score = 30.0  # Default neutral score
            logger.warning(f"No ESG scores available, using default neutral score: {neutral_score}")
        
        # Assign neutral score to tickers without ESG data
        for ticker in tickers:
            if ticker not in esg_scores:
                esg_scores[ticker] = neutral_score
                logger.info(f"Assigned neutral ESG score {neutral_score:.2f} to {ticker}")
        
        return esg_scores