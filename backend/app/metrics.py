import numpy as np
import pandas as pd
from typing import Dict

class RiskMetrics:
    """Calculate various portfolio risk metrics"""
    
    @staticmethod
    def calculate_volatility(returns: pd.Series, annualize: bool = True) -> float:
        """Calculate portfolio volatility"""
        vol = returns.std()
        if annualize:
            vol *= np.sqrt(252)
        return float(vol)
    
    @staticmethod
    def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
        """Calculate Sharpe ratio"""
        excess_returns = returns.mean() * 252 - risk_free_rate
        volatility = RiskMetrics.calculate_volatility(returns)
        return float(excess_returns / volatility) if volatility > 0 else 0.0
    
    @staticmethod
    def calculate_max_drawdown(returns: pd.Series) -> float:
        """Calculate maximum drawdown"""
        cumulative = (1 + returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        return float(drawdown.min())
    
    @staticmethod
    def calculate_var(returns: pd.Series, confidence: float = 0.95) -> float:
        """Calculate Value at Risk"""
        return float(np.percentile(returns, (1 - confidence) * 100))
    
    @staticmethod
    def calculate_cvar(returns: pd.Series, confidence: float = 0.95) -> float:
        """Calculate Conditional Value at Risk (Expected Shortfall)"""
        var = RiskMetrics.calculate_var(returns, confidence)
        return float(returns[returns <= var].mean())
    
    @staticmethod
    def calculate_rolling_sharpe_ratio(returns: pd.Series, window: int = 30, risk_free_rate: float = 0.02) -> pd.Series:
        """
        Calculate rolling Sharpe ratio.
        
        Args:
            returns: Series of daily returns
            window: Rolling window size in days
            risk_free_rate: Annual risk-free rate
            
        Returns:
            Series of rolling Sharpe ratios (NaN for insufficient data, not filled with 0)
        """
        rolling_mean = returns.rolling(window=window).mean() * 252
        rolling_std = returns.rolling(window=window).std() * np.sqrt(252)
        rolling_excess = rolling_mean - risk_free_rate
        rolling_sharpe = rolling_excess / rolling_std
        # Don't fill NaN with 0 - let caller filter them out
        return rolling_sharpe
    
    @staticmethod
    def calculate_rolling_volatility(returns: pd.Series, window: int = 30) -> pd.Series:
        """
        Calculate rolling volatility.
        
        Args:
            returns: Series of daily returns
            window: Rolling window size in days
            
        Returns:
            Series of rolling annualized volatility (NaN for insufficient data, not filled with 0)
        """
        rolling_vol = returns.rolling(window=window).std() * np.sqrt(252)
        # Don't fill NaN with 0 - let caller filter them out
        return rolling_vol
    
    @staticmethod
    def calculate_risk_decomposition(returns: pd.DataFrame, weights: np.ndarray) -> Dict[str, float]:
        """
        Calculate risk contribution of each asset to portfolio risk.
        
        Args:
            returns: DataFrame of asset returns
            weights: Portfolio weights array
            
        Returns:
            Dictionary mapping ticker to risk contribution percentage
        """
        # Calculate covariance matrix
        cov_matrix = returns.cov() * 252
        
        # Portfolio variance
        portfolio_variance = np.dot(weights, np.dot(cov_matrix, weights))
        portfolio_std = np.sqrt(portfolio_variance)
        
        if portfolio_std == 0:
            return {ticker: 0.0 for ticker in returns.columns}
        
        # Marginal contribution to risk (MCR)
        mcr = np.dot(cov_matrix, weights) / portfolio_std
        
        # Risk contribution = weight * MCR
        risk_contributions = weights * mcr
        
        # Convert to percentages
        total_contribution = np.sum(np.abs(risk_contributions))
        if total_contribution == 0:
            return {ticker: 0.0 for ticker in returns.columns}
        
        risk_decomp = {}
        for i, ticker in enumerate(returns.columns):
            risk_decomp[ticker] = float((risk_contributions[i] / total_contribution) * 100)
        
        return risk_decomp