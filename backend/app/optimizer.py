import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, List, Tuple
from .metrics import RiskMetrics


class PortfolioOptimizer:
    """Optimize portfolio weights using scipy.optimize."""
    
    def __init__(self, returns: pd.DataFrame, objective: str = "sharpe", portfolio_type: str = "long_only"):
        """
        Initialize optimizer.
        
        Args:
            returns: DataFrame of asset returns
            objective: Optimization objective ("sharpe", "sortino", "calmar")
            portfolio_type: "long_only" or "long_short"
        """
        self.returns = returns
        self.objective = objective
        self.portfolio_type = portfolio_type
        self.n_assets = len(returns.columns)
    
    def _objective_function(self, weights: np.ndarray) -> float:
        """
        Objective function to minimize (negative of the metric we want to maximize).
        
        Args:
            weights: Portfolio weights
            
        Returns:
            Negative of the optimization metric
        """
        portfolio_returns = (self.returns.values * weights).sum(axis=1)
        portfolio_returns = pd.Series(portfolio_returns)
        
        if self.objective == "sharpe":
            metric = -RiskMetrics.calculate_sharpe_ratio(portfolio_returns)
        elif self.objective == "sortino":
            # Calculate Sortino ratio
            downside_returns = portfolio_returns[portfolio_returns < 0]
            if len(downside_returns) > 0:
                downside_std = downside_returns.std() * (252 ** 0.5)
                if downside_std > 0:
                    expected_return = portfolio_returns.mean() * 252
                    metric = -((expected_return - 0.02) / downside_std)
                else:
                    metric = 0
            else:
                metric = 0
        elif self.objective == "calmar":
            # Calculate Calmar ratio
            max_dd = RiskMetrics.calculate_max_drawdown(portfolio_returns)
            expected_return = portfolio_returns.mean() * 252
            if max_dd < 0:
                metric = -(expected_return / abs(max_dd))
            else:
                metric = 0
        else:
            raise ValueError(f"Unknown objective: {self.objective}")
        
        return metric
    
    def _constraints(self) -> List[Dict]:
        """
        Define optimization constraints.
        
        Returns:
            List of constraint dictionaries for scipy.optimize
        """
        constraints = []
        
        # Budget constraint: weights sum to 1
        constraints.append({
            'type': 'eq',
            'fun': lambda w: np.sum(w) - 1.0
        })
        
        if self.portfolio_type == "long_short":
            # Leverage constraint: L1 norm <= 1.5
            constraints.append({
                'type': 'ineq',
                'fun': lambda w: 1.5 - np.sum(np.abs(w))
            })
        
        return constraints
    
    def _bounds(self) -> List[Tuple[float, float]]:
        """
        Define variable bounds.
        
        Returns:
            List of (min, max) tuples for each weight
        """
        if self.portfolio_type == "long_only":
            # Long-only: weights between 0 and 1
            return [(0.0, 1.0) for _ in range(self.n_assets)]
        else:
            # Long/short: weights between -1 and 1
            return [(-1.0, 1.0) for _ in range(self.n_assets)]
    
    def optimize(self) -> Tuple[np.ndarray, Dict]:
        """
        Optimize portfolio weights.
        
        Returns:
            Tuple of (optimal_weights, metrics_dict)
        """
        # Initial guess: equal weights
        x0 = np.ones(self.n_assets) / self.n_assets
        
        # Optimize
        result = minimize(
            fun=self._objective_function,
            x0=x0,
            method='SLSQP',
            bounds=self._bounds(),
            constraints=self._constraints(),
            options={'maxiter': 1000, 'ftol': 1e-9}
        )
        
        if not result.success:
            raise ValueError(f"Optimization failed: {result.message}")
        
        optimal_weights = result.x
        
        # Compute final metrics
        portfolio_returns = (self.returns.values * optimal_weights).sum(axis=1)
        portfolio_returns = pd.Series(portfolio_returns)
        
        metrics = {
            "expected_return": float(portfolio_returns.mean() * 252),
            "volatility": float(RiskMetrics.calculate_volatility(portfolio_returns)),
            "sharpe_ratio": float(RiskMetrics.calculate_sharpe_ratio(portfolio_returns)),
            "max_drawdown": float(RiskMetrics.calculate_max_drawdown(portfolio_returns))
        }
        
        # Add leverage for long/short
        if self.portfolio_type == "long_short":
            metrics["total_leverage"] = float(np.sum(np.abs(optimal_weights)))
        
        return optimal_weights, metrics
