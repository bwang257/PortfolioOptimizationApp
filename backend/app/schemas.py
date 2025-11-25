from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Optional


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