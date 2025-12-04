import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, List, Tuple, Optional
from .metrics import RiskMetrics


class PortfolioOptimizer:
    """Optimize portfolio weights using scipy.optimize."""
    
    def __init__(self, returns: pd.DataFrame, objective: str = "sharpe", portfolio_type: str = "long_only", 
                 esg_scores: Optional[Dict[str, float]] = None, esg_weight: float = 0.0):
        """
        Initialize optimizer.
        
        Args:
            returns: DataFrame of asset returns
            objective: Optimization objective ("sharpe", "sortino", "calmar", "min_variance")
            portfolio_type: "long_only" or "long_short"
            esg_scores: Dictionary mapping ticker to ESG score (lower is better)
            esg_weight: Weight for ESG in blended objective (0.0 to 1.0)
        """
        self.returns = returns
        self.objective = objective
        self.portfolio_type = portfolio_type
        self.n_assets = len(returns.columns)
        self.esg_scores = esg_scores or {}
        self.esg_weight = esg_weight
    
    def _normalize_esg_score(self, weights: np.ndarray) -> float:
        """
        Calculate normalized ESG score for portfolio.
        Lower ESG score is better, so we invert it for maximization.
        
        Args:
            weights: Portfolio weights
            
        Returns:
            Normalized ESG score (0-1, where 1 is best ESG)
        """
        if not self.esg_scores or self.esg_weight == 0.0:
            return 0.0
        
        # Calculate weighted average ESG score
        portfolio_esg = 0.0
        total_weight = 0.0
        
        for i, ticker in enumerate(self.returns.columns):
            if ticker in self.esg_scores:
                portfolio_esg += weights[i] * self.esg_scores[ticker]
                total_weight += weights[i]
        
        if total_weight == 0:
            return 0.0
        
        portfolio_esg = portfolio_esg / total_weight
        
        # Normalize ESG score: lower is better, so invert
        # Find min and max ESG scores for normalization
        if self.esg_scores:
            min_esg = min(self.esg_scores.values())
            max_esg = max(self.esg_scores.values())
            
            if max_esg > min_esg:
                # Invert: lower ESG score becomes higher normalized score
                normalized_esg = 1.0 - ((portfolio_esg - min_esg) / (max_esg - min_esg))
            else:
                normalized_esg = 1.0
        else:
            normalized_esg = 0.5  # Neutral score if no ESG data
        
        return normalized_esg
    
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
        
        # Calculate base metric for all objectives
        if self.objective == "sharpe":
            base_metric = -RiskMetrics.calculate_sharpe_ratio(portfolio_returns)
        elif self.objective == "sortino":
            # Calculate Sortino ratio
            downside_returns = portfolio_returns[portfolio_returns < 0]
            if len(downside_returns) > 0:
                downside_std = downside_returns.std() * (252 ** 0.5)
                if downside_std > 0:
                    expected_return = portfolio_returns.mean() * 252
                    base_metric = -((expected_return - 0.02) / downside_std)
                else:
                    base_metric = 0
            else:
                base_metric = 0
        elif self.objective == "calmar":
            # Calculate Calmar ratio
            max_dd = RiskMetrics.calculate_max_drawdown(portfolio_returns)
            expected_return = portfolio_returns.mean() * 252
            if max_dd < 0:
                base_metric = -(expected_return / abs(max_dd))
            else:
                base_metric = 0
        elif self.objective == "min_variance":
            # Minimize portfolio variance (volatility)
            # Calculate portfolio variance directly
            cov_matrix = self.returns.cov() * 252
            portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
            base_metric = portfolio_variance  # Minimize variance directly
        else:
            raise ValueError(f"Unknown objective: {self.objective}")
        
        # Apply ESG blending if ESG weight > 0
        if self.esg_weight > 0 and self.esg_scores:
            normalized_esg = self._normalize_esg_score(weights)
            
            if self.objective == "min_variance":
                # For min_variance, we minimize variance
                # Blend: minimize (1-esg_weight)*variance - esg_weight*normalized_esg
                # Scale ESG to match variance scale
                cov_matrix = self.returns.cov() * 252
                max_var = np.max(np.diag(cov_matrix)) if len(cov_matrix) > 0 else 1.0
                # Scale normalized_esg (0-1) to variance scale
                esg_component = normalized_esg * max_var * 0.1  # Scale ESG contribution
                metric = (1 - self.esg_weight) * base_metric - self.esg_weight * esg_component
            else:
                # For maximization objectives (sharpe, sortino, calmar)
                # base_metric is negative (we minimize negative of metric to maximize metric)
                # We want to maximize: (1-esg_weight)*metric + esg_weight*normalized_esg
                # So we minimize: -(1-esg_weight)*metric - esg_weight*normalized_esg
                # = (1-esg_weight)*(-metric) - esg_weight*normalized_esg
                # = (1-esg_weight)*base_metric - esg_weight*normalized_esg
                # Scale ESG to match metric scale (typical sharpe/sortino/calmar are 0-3)
                esg_scale = 2.0  # Scale factor to match typical metric range
                esg_component = normalized_esg * esg_scale
                metric = (1 - self.esg_weight) * base_metric - self.esg_weight * esg_component
        else:
            metric = base_metric
        
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
        Optimize portfolio weights with multiple random restarts for global optimization.
        
        Returns:
            Tuple of (optimal_weights, metrics_dict)
        """
        best_result = None
        best_value = float('inf')
        num_restarts = 5
        
        # Try multiple random initial guesses
        for attempt in range(num_restarts):
            if attempt == 0:
                # First attempt: equal weights
        x0 = np.ones(self.n_assets) / self.n_assets
            else:
                # Random initial guess
                if self.portfolio_type == "long_only":
                    x0 = np.random.dirichlet(np.ones(self.n_assets))
                else:
                    # For long/short, use random weights that sum close to 1
                    x0 = np.random.uniform(-0.5, 0.5, self.n_assets)
                    x0 = x0 / np.sum(np.abs(x0)) * 0.5  # Normalize to reasonable leverage
            
            try:
        result = minimize(
            fun=self._objective_function,
            x0=x0,
            method='SLSQP',
            bounds=self._bounds(),
            constraints=self._constraints(),
                    options={'maxiter': 2000, 'ftol': 1e-9}
                )
                
                if result.success and result.fun < best_value:
                    best_value = result.fun
                    best_result = result
            except:
                continue
        
        if best_result is None:
            # Fallback to equal weights if all attempts fail
            x0 = np.ones(self.n_assets) / self.n_assets
            best_result = minimize(
                fun=self._objective_function,
                x0=x0,
                method='SLSQP',
                bounds=self._bounds(),
                constraints=self._constraints(),
                options={'maxiter': 2000, 'ftol': 1e-9}
        )
        
        if not best_result.success:
            raise ValueError(f"Optimization failed: {best_result.message}")
        
        optimal_weights = best_result.x
        
        # Validate weights
        if np.abs(np.sum(optimal_weights) - 1.0) > 1e-6:
            raise ValueError("Optimization produced invalid weights (sum != 1)")
        
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
    
    def calculate_efficient_frontier(self, num_points: int = 100, extend_beyond_return: float = None, extend_beyond_risk: float = None) -> List[Dict[str, float]]:
        """
        Calculate efficient frontier points with proper lambda closure handling.
        
        Args:
            num_points: Number of points on the efficient frontier
            extend_beyond_return: If provided, extend frontier beyond this return value
            
        Returns:
            List of dictionaries with 'risk' and 'return' keys, sorted by risk
        """
        # Calculate expected returns and covariance matrix
        mean_returns = self.returns.mean() * 252
        cov_matrix = self.returns.cov() * 252
        
        # Find min and max expected returns achievable
        # For min return, find minimum variance portfolio
        # For max return, find maximum return portfolio
        bounds = self._bounds()
        
        # Find minimum variance portfolio (lower bound)
        def portfolio_variance(weights):
            return np.dot(weights.T, np.dot(cov_matrix, weights))
        
        constraints_min = [{'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0}]
        if self.portfolio_type == "long_short":
            constraints_min.append({'type': 'ineq', 'fun': lambda w: 1.5 - np.sum(np.abs(w))})
        
        result_min = minimize(
            portfolio_variance,
            np.ones(self.n_assets) / self.n_assets,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints_min,
            options={'maxiter': 1000}
        )
        
        if result_min.success:
            min_return = float(np.dot(result_min.x, mean_returns))
        else:
        min_return = mean_returns.min()
        
        # Find maximum return portfolio (upper bound)
        def neg_return(weights):
            return -np.dot(weights, mean_returns)
        
        result_max = minimize(
            neg_return,
            np.ones(self.n_assets) / self.n_assets,
            method='SLSQP',
            bounds=bounds,
            constraints=constraints_min,
            options={'maxiter': 1000}
        )
        
        if result_max.success:
            max_return = float(np.dot(result_max.x, mean_returns))
        else:
        max_return = mean_returns.max()
        
        # Always extend beyond current portfolio return if specified
        # This ensures the frontier has points beyond the current portfolio
        if extend_beyond_return is not None:
            # Always extend beyond the current portfolio return
            # Use at least 40% extension beyond current return, or 25% of total range, whichever is larger
            extension = max(
                extend_beyond_return * 0.4,  # 40% beyond current return
                (max_return - min_return) * 0.25,  # Or 25% of total range
                (max_return - min_return) * 0.15  # At minimum 15% of total range
            )
            # Set max_return to be well beyond the current portfolio
            # Ensure we always have points beyond, even if current portfolio is already at max
            max_return = max(extend_beyond_return + extension, max_return * 1.15)
        
        # Generate target returns
        target_returns = np.linspace(min_return, max_return, num_points)
        
        efficient_frontier = []
        
        for target_return in target_returns:
            # Fix lambda closure bug by using default parameter
            def make_return_constraint(tr):
                return lambda w: np.dot(w, mean_returns) - tr
            
            # Minimize volatility for given target return
            constraints = [
                {
                    'type': 'eq',
                    'fun': lambda w: np.sum(w) - 1.0
                },
                {
                    'type': 'eq',
                    'fun': make_return_constraint(target_return)
                }
            ]
            
            if self.portfolio_type == "long_short":
                constraints.append({
                    'type': 'ineq',
                    'fun': lambda w: 1.5 - np.sum(np.abs(w))
                })
            
            # Use previous solution as initial guess if available for better convergence
            if efficient_frontier:
                # Try to use last successful weights, but we don't store them
                # Use a weighted average approach: bias towards higher return assets
                x0 = np.ones(self.n_assets) / self.n_assets
                if len(mean_returns) > 0:
                    # Slightly bias towards higher return assets for better convergence
                    return_weights = mean_returns / mean_returns.sum()
                    x0 = 0.8 * x0 + 0.2 * return_weights
                    x0 = x0 / x0.sum()  # Normalize
            else:
            x0 = np.ones(self.n_assets) / self.n_assets
            
            try:
                result = minimize(
                    portfolio_variance,
                    x0,
                    method='SLSQP',
                    bounds=bounds,
                    constraints=constraints,
                    options={'maxiter': 2000, 'ftol': 1e-9}
                )
                
                if result.success:
                    weights = result.x
                    portfolio_return = float(np.dot(weights, mean_returns))
                    portfolio_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
                    
                    # Validate the point
                    if portfolio_vol > 0 and np.isfinite(portfolio_return) and np.isfinite(portfolio_vol):
                    efficient_frontier.append({
                        'risk': portfolio_vol,
                        'return': portfolio_return
                    })
            except Exception as e:
                # Skip if optimization fails for this point
                continue
        
        # Sort by risk to ensure proper curve shape
        efficient_frontier.sort(key=lambda x: x['risk'])
        
        # Filter out duplicate or invalid points
        filtered_frontier = []
        prev_risk = None
        for point in efficient_frontier:
            # Skip if risk is too close to previous point (within 0.1%)
            if prev_risk is None or abs(point['risk'] - prev_risk) / prev_risk > 0.001:
                filtered_frontier.append(point)
                prev_risk = point['risk']
        
        # Always extend beyond current portfolio point to show the frontier continues
        # This ensures the curve extends past the red dot on the chart
        # Generate additional data points beyond the current portfolio for the chart
        if extend_beyond_risk is not None and extend_beyond_return is not None and len(filtered_frontier) > 0:
            max_risk_in_frontier = max(p['risk'] for p in filtered_frontier)
            max_return_in_frontier = max(p['return'] for p in filtered_frontier)
            
            # Always extend beyond current portfolio to ensure the line continues past the red dot
            # Check if we need to generate more points
            needs_extension = (
                extend_beyond_risk >= max_risk_in_frontier * 0.95 or  # Within 5% of max risk
                extend_beyond_return >= max_return_in_frontier * 0.95 or  # Within 5% of max return
                extend_beyond_risk > max_risk_in_frontier or  # Beyond max risk
                extend_beyond_return > max_return_in_frontier  # Beyond max return
            )
            
            # Always extend to show the curve continues beyond the current portfolio
            if needs_extension:
                # Current portfolio is at or near the end of frontier - need to extend
                # Use the last point in the frontier as the starting point
                
                # Estimate target return needed to reach current portfolio risk + buffer
                # Use the slope from the last few points
                if len(filtered_frontier) >= 2:
                    last_point = filtered_frontier[-1]
                    second_last_point = filtered_frontier[-2]
                    
                    # Generate additional points by optimizing for progressively higher returns
                    # This maintains the curve shape naturally since each point is optimized
                    # Use smaller increments to ensure smooth curve continuation
                    last_point = filtered_frontier[-1]
                    
                    # Calculate return increment based on the last few points to maintain curve shape
                    if len(filtered_frontier) >= 3:
                        # Use last 3 points to estimate return increment per step
                        p1 = filtered_frontier[-3]
                        p2 = filtered_frontier[-2]
                        p3 = filtered_frontier[-1]
                        
                        # Calculate average return increment from last points
                        return_inc1 = p2['return'] - p1['return']
                        return_inc2 = p3['return'] - p2['return']
                        avg_return_increment = (return_inc1 + return_inc2) / 2 if (return_inc1 > 0 and return_inc2 > 0) else return_inc2 if return_inc2 > 0 else (max_return - min_return) / 100
                    else:
                        # Fallback: use a small increment
                        avg_return_increment = (max_return - min_return) / 100
                    
                    # Generate target returns with small increments to maintain smooth curve
                    # Start from just above the last point and extend well beyond current portfolio
                    start_return = last_point['return'] + avg_return_increment * 0.3
                    # Extend to at least 40% beyond current portfolio return, ensuring we have enough points
                    target_extension = max(
                        extend_beyond_return * 1.4,  # 40% beyond current portfolio
                        last_point['return'] + avg_return_increment * 30,  # Or 30 increments
                        last_point['return'] * 1.3  # At least 30% more return than last point
                    )
                    end_return = target_extension
                    num_extra_points = 60  # More points for smoother curve beyond current portfolio
                    extra_returns = np.linspace(start_return, end_return, num_extra_points)
                    
                    # Use last successful weights as starting point
                    # Start with equal weights but biased towards higher return assets for better convergence
                    x0_start = np.ones(self.n_assets) / self.n_assets
                    if len(mean_returns) > 0:
                        # Bias towards assets with higher expected returns
                        return_weights = mean_returns / mean_returns.sum()
                        x0_start = 0.6 * x0_start + 0.4 * return_weights
                        # Normalize to ensure it sums to 1
                        x0_start = x0_start / x0_start.sum()
                    
                    successful_points = 0
                    for extra_return in extra_returns:
                        def make_return_constraint(tr):
                            return lambda w: np.dot(w, mean_returns) - tr
                        
                        constraints = [
                            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1.0},
                            {'type': 'eq', 'fun': make_return_constraint(extra_return)}
                        ]
                        
                        if self.portfolio_type == "long_short":
                            constraints.append({
                                'type': 'ineq',
                                'fun': lambda w: 1.5 - np.sum(np.abs(w))
                            })
                        
                        try:
                            result = minimize(
                                portfolio_variance,
                                x0_start,
                                method='SLSQP',
                                bounds=bounds,
                                constraints=constraints,
                                options={'maxiter': 2000, 'ftol': 1e-9}
                            )
                            
                            if result.success:
                                weights = result.x
                                portfolio_return = float(np.dot(weights, mean_returns))
                                portfolio_vol = float(np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))))
                                
                                if portfolio_vol > 0 and np.isfinite(portfolio_return) and np.isfinite(portfolio_vol):
                                    # Priority 1: Add if beyond current portfolio (this is most important)
                                    # Priority 2: Add if extends beyond last point (for smooth curve)
                                    # This ensures we always get points beyond the current portfolio
                                    beyond_current_portfolio = (
                                        portfolio_vol >= extend_beyond_risk * 0.99 or  # At or beyond current portfolio risk
                                        portfolio_return >= extend_beyond_return * 0.99  # At or beyond current portfolio return
                                    )
                                    
                                    extends_last_point = (
                                        portfolio_vol >= last_point['risk'] * 0.998 or  # At least 99.8% of last risk
                                        portfolio_return >= last_point['return'] * 0.998  # At least 99.8% of last return
                                    )
                                    
                                    # Add point if it's beyond current portfolio OR extends beyond last point
                                    # This ensures we get points beyond the current portfolio even if optimization results vary slightly
                                    if beyond_current_portfolio or extends_last_point:
                                        filtered_frontier.append({
                                            'risk': portfolio_vol,
                                            'return': portfolio_return
                                        })
                                        # Update starting point for next iteration using successful weights
                                        x0_start = weights
                                        successful_points += 1
                                        
                                        # Stop if we've extended well beyond the current portfolio (40% buffer)
                                        if portfolio_vol > extend_beyond_risk * 1.4 and portfolio_return > extend_beyond_return * 1.4:
                                            break
                        except:
                            continue
                    
                    # Re-sort after adding extra points
                    filtered_frontier.sort(key=lambda x: x['risk'])
        
        return filtered_frontier