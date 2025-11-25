from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Optional, Any


class PortfolioRequest(BaseModel):
    tickers: List[str] = Field(..., min_items=1, max_items=30, description="List of stock tickers")
    objective: Literal["sharpe", "sortino", "calmar"] = Field(..., description="Optimization objective")
    portfolio_type: Literal["long_only", "long_short"] = Field(..., description="Portfolio constraint type")
    lookback_days: Optional[int] = Field(252, ge=30, le=2520, description="Number of trading days for historical data")


class PortfolioResponse(BaseModel):
    weights: Dict[str, float] = Field(..., description="Optimal weights for each ticker")
    expected_return: float = Field(..., description="Expected annualized return")
    volatility: float = Field(..., description="Annualized volatility")
    sharpe_ratio: Optional[float] = Field(None, description="Sharpe ratio")
    sortino_ratio: Optional[float] = Field(None, description="Sortino ratio")
    calmar_ratio: Optional[float] = Field(None, description="Calmar ratio")
    max_drawdown: Optional[float] = Field(None, description="Maximum drawdown")
    total_leverage: Optional[float] = Field(None, description="Total leverage (L1 norm) for long/short")
    price_history: Optional[Dict[str, List[Dict[str, Any]]]] = Field(None, description="Historical price data by ticker")
    portfolio_returns: Optional[List[Dict[str, Any]]] = Field(None, description="Portfolio cumulative returns over time")
    correlation_matrix: Optional[Dict[str, Dict[str, float]]] = Field(None, description="Asset correlation matrix")
    efficient_frontier: Optional[List[Dict[str, float]]] = Field(None, description="Efficient frontier points (risk-return pairs)")
    rolling_metrics: Optional[Dict[str, List[Dict[str, Any]]]] = Field(None, description="Rolling Sharpe ratio and volatility over time")
    risk_decomposition: Optional[Dict[str, float]] = Field(None, description="Risk contribution percentage by asset")


class TickerInfo(BaseModel):
    symbol: str = Field(..., description="Stock ticker symbol")
    name: str = Field(..., description="Company name")


class TickerSearchResponse(BaseModel):
    results: List[TickerInfo] = Field(..., description="List of matching tickers")