import pytest
import pandas as pd
import numpy as np
from app.optimizer import PortfolioOptimizer


def test_long_only_optimization():
    """Test long-only portfolio optimization."""
    returns = pd.DataFrame({
        'AAPL': np.random.normal(0.001, 0.02, 252),
        'MSFT': np.random.normal(0.001, 0.015, 252),
        'GOOGL': np.random.normal(0.0008, 0.018, 252)
    })
    
    optimizer = PortfolioOptimizer(returns, objective="sharpe", portfolio_type="long_only")
    weights, metrics = optimizer.optimize()
    
    # Check constraints
    assert np.allclose(np.sum(weights), 1.0, atol=1e-6)
    assert np.all(weights >= -1e-6)  # Allow small numerical errors
    assert np.all(weights <= 1.0 + 1e-6)
    
    # Check metrics
    assert "expected_return" in metrics
    assert "sharpe_ratio" in metrics


def test_long_short_optimization():
    """Test long/short portfolio optimization."""
    returns = pd.DataFrame({
        'AAPL': np.random.normal(0.001, 0.02, 252),
        'MSFT': np.random.normal(0.001, 0.015, 252)
    })
    
    optimizer = PortfolioOptimizer(returns, objective="sharpe", portfolio_type="long_short")
    weights, metrics = optimizer.optimize()
    
    # Check constraints
    assert np.allclose(np.sum(weights), 1.0, atol=1e-6)
    leverage = np.sum(np.abs(weights))
    assert leverage <= 1.5 + 1e-6
    
    # Check leverage in metrics
    assert "total_leverage" in metrics
    assert metrics["total_leverage"] <= 1.5 + 1e-6


def test_different_objectives():
    """Test optimization with different objectives."""
    returns = pd.DataFrame({
        'AAPL': np.random.normal(0.001, 0.02, 252),
        'MSFT': np.random.normal(0.001, 0.015, 252)
    })
    
    for objective in ["sharpe", "sortino", "calmar"]:
        optimizer = PortfolioOptimizer(returns, objective=objective, portfolio_type="long_only")
        weights, metrics = optimizer.optimize()
        
        assert np.allclose(np.sum(weights), 1.0, atol=1e-6)
        assert objective.replace("_ratio", "") in str(metrics).lower() or objective in str(metrics).lower()