import yfinance as yf
import pandas as pd
import numpy as np
from typing import List, Dict
from datetime import datetime, timedelta
import logging
from dotenv import load_dotenv

load_dotenv()
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
        # Increase buffer to ensure rolling metrics don't start at 0
        buffer_days = max(120, int(self.lookback_days * 0.6))
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
        Fetch ESG scores for given tickers using Financial Modeling Prep API.
        Falls back to yfinance if API key is not available or requests fail.
        
        Args:
            tickers: List of stock ticker symbols
            
        Returns:
            Dictionary mapping ticker to ESG score (lower is better)
            Missing or unavailable data gets a neutral score based on available scores
        """
        import time
        import os
        import httpx
        
        esg_scores: Dict[str, float] = {}
        available_scores = []
        
        # FMP API key - using provided key
        fmp_api_key = os.getenv('FMP_API_KEY', 'BmNs8fhXgnTdXcDVlWtCH2I35mTHRuq3')
        
        if fmp_api_key:
            logger.info(f"Using Financial Modeling Prep API for ESG data for {len(tickers)} tickers")
            fmp_failed = False
            
            try:
                # FMP API - use new stable endpoint format
                for i, ticker in enumerate(tickers):
                    if fmp_failed:
                        break
                        
                    if i > 0:
                        time.sleep(0.25)  # Rate limiting: ~4 requests per second
                    
                    try:
                        # Try new stable endpoint first
                        url = f"https://financialmodelingprep.com/stable/esg-ratings?symbol={ticker}&apikey={fmp_api_key}"
                        success = False
                        
                        with httpx.Client(timeout=10.0) as client:
                            response = client.get(url)
                            
                            # Process successful response
                            if response.status_code == 200:
                                try:
                                    data = response.json()
                                    # Handle both list and dict responses
                                    if isinstance(data, list) and len(data) > 0:
                                        esg_data = data[0]
                                    elif isinstance(data, dict):
                                        esg_data = data
                                    else:
                                        logger.warning(f"Unexpected FMP response format for {ticker}")
                                        continue
                                    
                                    # Try different possible field names for ESG score
                                    esg_score = None
                                    
                                    # Check for various possible field names
                                    for field in ['esgScore', 'esg_score', 'totalEsg', 'total_esg', 'rating', 'score', 'environmentalScore', 'socialScore', 'governanceScore']:
                                        if field in esg_data:
                                            try:
                                                val = esg_data[field]
                                                esg_score = float(val)
                                                if not pd.isna(esg_score) and esg_score > 0:
                                                    logger.debug(f"Found ESG score for {ticker} in field '{field}': {esg_score}")
                                                    break
                                            except (ValueError, TypeError):
                                                continue
                                    
                                    # If we have individual E, S, G scores, calculate average
                                    if esg_score is None:
                                        e_score = esg_data.get('environmentalScore') or esg_data.get('e')
                                        s_score = esg_data.get('socialScore') or esg_data.get('s')
                                        g_score = esg_data.get('governanceScore') or esg_data.get('g')
                                        
                                        scores = []
                                        for score in [e_score, s_score, g_score]:
                                            try:
                                                if score is not None:
                                                    scores.append(float(score))
                                            except (ValueError, TypeError):
                                                pass
                                        
                                        if scores:
                                            esg_score = sum(scores) / len(scores)
                                            logger.debug(f"Calculated average ESG score for {ticker} from E/S/G components: {esg_score}")
                                    
                                    if esg_score is not None and esg_score > 0:
                                        # FMP typically returns ESG score (0-100, higher is better)
                                        # Convert to inverted scale (100 - score) so lower is better for optimization
                                        inverted_score = 100.0 - esg_score
                                        esg_scores[ticker] = inverted_score
                                        available_scores.append(inverted_score)
                                        logger.info(f"Fetched ESG score for {ticker} from FMP: {esg_score} (inverted: {inverted_score:.2f})")
                                        success = True
                                    else:
                                        logger.warning(f"FMP API returned data for {ticker} but no valid ESG score found. Response: {str(esg_data)[:200]}")
                                except Exception as parse_error:
                                    logger.warning(f"Failed to parse FMP response for {ticker}: {str(parse_error)}")
                                    logger.debug(f"Response text: {response.text[:500]}")
                            
                            # If new endpoint failed (non-200 or no valid data), try old endpoint format as fallback
                            if not success:
                                logger.debug(f"Trying legacy FMP endpoint for {ticker}")
                                try:
                                    legacy_url = f"https://financialmodelingprep.com/api/v3/esg-score/{ticker}?apikey={fmp_api_key}"
                                    legacy_response = client.get(legacy_url)
                                    
                                    if legacy_response.status_code == 200:
                                        try:
                                            legacy_data = legacy_response.json()
                                            if legacy_data and isinstance(legacy_data, list) and len(legacy_data) > 0:
                                                legacy_esg_data = legacy_data[0]
                                                if 'esgScore' in legacy_esg_data:
                                                    esg_score = float(legacy_esg_data['esgScore'])
                                                    if not pd.isna(esg_score) and esg_score > 0:
                                                        inverted_score = 100.0 - esg_score
                                                        esg_scores[ticker] = inverted_score
                                                        available_scores.append(inverted_score)
                                                        logger.info(f"Fetched ESG score for {ticker} from FMP (legacy endpoint): {esg_score} (inverted: {inverted_score:.2f})")
                                                        success = True
                                        except Exception as e:
                                            logger.debug(f"Legacy endpoint parse failed: {str(e)}")
                                    elif legacy_response.status_code == 403:
                                        # Both endpoints returned 403 - likely subscription issue
                                        logger.warning(f"Both FMP endpoints returned 403 Forbidden for {ticker}. ESG endpoint may require paid subscription.")
                                        logger.warning(f"Response body: {legacy_response.text[:200]}")
                                        # Don't break here - continue to next ticker, will fall back to yfinance
                                    elif legacy_response.status_code == 401:
                                        logger.warning(f"Legacy FMP endpoint returned 401 Unauthorized - API key may be invalid")
                                        fmp_failed = True
                                        break
                                except Exception as e:
                                    logger.debug(f"Legacy endpoint request failed: {str(e)}")
                            
                            if success:
                                continue
                            
                            # Handle error codes from first endpoint if we didn't succeed
                            if response.status_code == 403:
                                # 403 Forbidden - API key may not have access or endpoint requires subscription
                                logger.warning(f"FMP API returned 403 Forbidden for {ticker}. ESG endpoint may require paid subscription.")
                                logger.warning(f"Response body: {response.text[:200]}")
                                # Continue to next ticker - will fall back to yfinance
                            elif response.status_code == 429:
                                logger.warning(f"Rate limit reached for FMP API (429), will try remaining tickers with yfinance")
                                break
                            elif response.status_code == 401:
                                logger.warning(f"FMP API returned 401 Unauthorized - API key may be invalid")
                                fmp_failed = True
                                break
                            else:
                                # Other error codes - log and continue to next ticker
                                if response.status_code != 200:
                                    logger.warning(f"FMP API returned {response.status_code} for {ticker}: {response.text[:200]}")
                    except httpx.TimeoutException:
                        logger.warning(f"FMP API request timeout for {ticker}, will try yfinance fallback")
                        continue
                    except Exception as e:
                        logger.warning(f"FMP API request failed for {ticker}: {str(e)}")
                        continue
            except Exception as e:
                logger.warning(f"Error using FMP API: {str(e)}, falling back to yfinance")
        
        # Fallback to yfinance for any tickers not yet processed
        remaining_tickers = [t for t in tickers if t not in esg_scores]
        if remaining_tickers:
            logger.info(f"Fetching ESG data for {len(remaining_tickers)} tickers using yfinance fallback")
            for i, ticker in enumerate(remaining_tickers):
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
                                        logger.info(f"Fetched ESG score for {ticker} from yfinance info: {total_esg}")
                                        continue
                                except (ValueError, TypeError):
                                    pass
                    except Exception as e:
                        logger.debug(f"yfinance info method failed for {ticker}: {str(e)}")
                    
                    # Method 2: Try sustainability DataFrame
                    try:
                        sustainability = stock.sustainability
                        if sustainability is not None and not sustainability.empty:
                            if 'totalEsg' in sustainability.index:
                                if len(sustainability.columns) > 0:
                                    total_esg = sustainability.loc['totalEsg', sustainability.columns[0]]
                                else:
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
                                        logger.info(f"Fetched ESG score for {ticker} from yfinance sustainability: {total_esg}")
                                        continue
                                except (ValueError, TypeError):
                                    pass
                    except Exception as e:
                        logger.debug(f"yfinance sustainability method failed for {ticker}: {str(e)}")
                    
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