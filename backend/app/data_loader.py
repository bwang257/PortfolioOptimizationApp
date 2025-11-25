import yfinance as yf
import pandas as pd
import numpy as np
from typing import List
from datetime import datetime, timedelta

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