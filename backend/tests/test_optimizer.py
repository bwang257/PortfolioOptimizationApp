import pytest
import pandas as pd
import numpy as np
from app.metrics import RiskMetrics


def test_sharpe_ratio():
    """Test Sharpe ratio calculation."""
    # Create sample returns
    returns = pd.Series([0.01, -0.02, 0.03, 0.01, -0.01] * 50)
    
    sharpe = RiskMetrics.sharpe_ratio(returns)
    
    assert isinstance(sharpe, float)
    assert not np.isnan(sharpe)
    assert not np.isinf(sharpe)


def test_sortino_ratio():
    """Test Sortino ratio calculation."""
    returns = pd.Series([0.01, -0.02, 0.03, 0.01, -0.01] * 50)
    
    sortino = RiskMetrics.sortino_ratio(returns)
    
    assert isinstance(sortino, float)
    assert not np.isnan(sortino)
    assert not np.isinf(sortino)


def test_calmar_ratio():
    """Test Calmar ratio calculation."""
    returns = pd.Series([0.01, -0.02, 0.03, 0.01, -0.01] * 50)
    
    calmar = RiskMetrics.calmar_ratio(returns)
    
    assert isinstance(calmar, float)
    assert not np.isnan(calmar)


def test_max_drawdown():
    """Test maximum drawdown calculation."""
    returns = pd.Series([0.01, -0.05, 0.02, -0.03, 0.01] * 50)
    
    max_dd, cumulative = RiskMetrics.max_drawdown(returns)
    
    assert max_dd >= 0
    assert len(cumulative) == len(returns)


def test_portfolio_metrics():
    """Test portfolio metrics computation."""
    returns = pd.DataFrame({
        'AAPL': np.random.normal(0.001, 0.02, 100),
        'MSFT': np.random.normal(0.001, 0.015, 100)
    })
    
    weights = np.array([0.6, 0.4])
    
    metrics = RiskMetrics.portfolio_metrics(weights, returns, "sharpe")
    
    assert "expected_return" in metrics
    assert "volatility" in metrics
    assert "sharpe_ratio" in metrics
    assert isinstance(metrics["expected_return"], float)