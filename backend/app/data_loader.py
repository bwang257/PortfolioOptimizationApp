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
        
        # Calculate start date
        end_date = datetime.now()
        start_date = end_date - timedelta(days=self.lookback_days * 2)
        
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
        min_required_days = self.lookback_days * 0.8
        valid_tickers = []
        for ticker in tickers:
            if ticker in prices.columns:
                non_null_count = prices[ticker].notna().sum()
                if non_null_count >= min_required_days:
                    valid_tickers.append(ticker)
        
        if not valid_tickers:
            raise ValueError("No tickers with sufficient historical data")
        
        prices = prices[valid_tickers]
        prices = prices.tail(self.lookback_days)
        prices = prices.dropna()
        
        if len(prices) < 30:
            raise ValueError(f"Insufficient data: only {len(prices)} days available")
        
        return prices
    
    def compute_returns(self, prices: pd.DataFrame) -> pd.DataFrame:
        """Compute daily returns from prices"""
        returns = prices.pct_change().dropna()
        return returns