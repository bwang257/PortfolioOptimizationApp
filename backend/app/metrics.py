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
