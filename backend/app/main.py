from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PortfolioRequest, PortfolioResponse, TickerSearchResponse, TickerInfo
from .data_loader import DataLoader
from .optimizer import PortfolioOptimizer
from .metrics import RiskMetrics
import logging
import json
import os
import numpy as np
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load ticker database
TICKER_DB_PATH = Path(__file__).parent.parent / "data" / "tickers.json"
TICKER_DB = []
if TICKER_DB_PATH.exists():
    with open(TICKER_DB_PATH, 'r') as f:
        TICKER_DB = json.load(f)
else:
    logger.warning(f"Ticker database not found at {TICKER_DB_PATH}")

# Load portfolio presets
PORTFOLIO_PRESETS_PATH = Path(__file__).parent.parent / "data" / "portfolio_presets.json"
PORTFOLIO_PRESETS = []
if PORTFOLIO_PRESETS_PATH.exists():
    with open(PORTFOLIO_PRESETS_PATH, 'r') as f:
        PORTFOLIO_PRESETS = json.load(f)
else:
    logger.warning(f"Portfolio presets not found at {PORTFOLIO_PRESETS_PATH}")

# Create FastAPI app
app = FastAPI(
    title="Portfolio Optimization API",
    description="API for optimizing investment portfolios using various risk metrics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Portfolio Optimization API is running",
        "status": "healthy",
        "version": "1.0.0"
    }


@app.post("/optimize", response_model=PortfolioResponse)
async def optimize_portfolio(request: PortfolioRequest):
    """
    Optimize portfolio allocation based on specified objective and constraints.
    
    Args:
        request: Portfolio optimization parameters
        
    Returns:
        Optimized portfolio weights and performance metrics
    """
    try:
        logger.info(f"Optimizing portfolio for tickers: {request.tickers}")
        
        # Load historical data
        data_loader = DataLoader(lookback_days=request.lookback_days)
        prices = data_loader.fetch_prices(request.tickers)
        returns = data_loader.compute_returns(prices)
        
        logger.info(f"Loaded {len(prices)} days of data for {len(request.tickers)} tickers")
        
        # Fetch ESG scores if ESG weight > 0
        esg_scores = None
        esg_weight = request.esg_weight or 0.0
        if esg_weight > 0:
            logger.info(f"Fetching ESG scores for {len(request.tickers)} tickers (ESG weight: {esg_weight})")
            try:
                esg_scores = DataLoader.fetch_esg_scores(request.tickers)
                logger.info(f"Successfully fetched ESG scores for {len(esg_scores)} tickers")
            except Exception as e:
                logger.warning(f"Failed to fetch ESG scores: {str(e)}. Continuing without ESG optimization.")
                esg_scores = None
                esg_weight = 0.0
        
        # Use only the requested lookback period for optimization
        # But keep all data for rolling metrics and price history
        returns_for_optimization = returns.tail(request.lookback_days)
        
        # Optimize portfolio
        optimizer = PortfolioOptimizer(
            returns=returns_for_optimization,
            objective=request.objective,
            portfolio_type=request.portfolio_type,
            esg_scores=esg_scores,
            esg_weight=esg_weight
        )
        optimal_weights, metrics = optimizer.optimize()
        
        # Convert weights array to dictionary
        weights_dict = {ticker: float(weight) for ticker, weight in zip(request.tickers, optimal_weights)}
        
        # Calculate portfolio returns for additional metrics using all available data
        # This ensures rolling metrics have enough historical data
        portfolio_returns = (returns * optimal_weights).sum(axis=1)
        expected_return = float(portfolio_returns.mean() * 252)
        volatility = RiskMetrics.calculate_volatility(portfolio_returns)
        sharpe_ratio = RiskMetrics.calculate_sharpe_ratio(portfolio_returns)
        max_drawdown = RiskMetrics.calculate_max_drawdown(portfolio_returns)
        
        # Calculate Sortino ratio
        downside_returns = portfolio_returns[portfolio_returns < 0]
        sortino_ratio = None
        if len(downside_returns) > 0:
            downside_std = downside_returns.std() * (252 ** 0.5)
            if downside_std > 0:
                sortino_ratio = float((expected_return - 0.02) / downside_std)
        
        # Calculate Calmar ratio
        calmar_ratio = None
        if max_drawdown < 0:
            calmar_ratio = float(expected_return / abs(max_drawdown))
        
        # Get total leverage from metrics if available
        total_leverage = metrics.get("total_leverage", None)
        
        # Prepare price history data
        price_history = {}
        for ticker in request.tickers:
            if ticker in prices.columns:
                price_history[ticker] = [
                    {"date": str(date), "price": float(price)}
                    for date, price in prices[ticker].items()
                ]
        
        # Calculate portfolio cumulative returns
        portfolio_cumulative = (1 + portfolio_returns).cumprod()
        portfolio_returns_data = [
            {"date": str(date), "value": float(value)}
            for date, value in portfolio_cumulative.items()
        ]
        
        # Calculate correlation matrix
        correlation_matrix = {}
        for i, ticker1 in enumerate(request.tickers):
            correlation_matrix[ticker1] = {}
            for j, ticker2 in enumerate(request.tickers):
                if ticker1 in returns.columns and ticker2 in returns.columns:
                    corr = float(returns[ticker1].corr(returns[ticker2]))
                    correlation_matrix[ticker1][ticker2] = corr
        
        # Calculate efficient frontier
        efficient_frontier = optimizer.calculate_efficient_frontier(num_points=50)
        
        # Calculate theoretical expected return and volatility using same method as efficient frontier
        # This ensures the current portfolio point appears on the frontier line
        mean_returns = returns_for_optimization.mean() * 252
        cov_matrix = returns_for_optimization.cov() * 252
        expected_return_theoretical = float(np.dot(optimal_weights, mean_returns))
        volatility_theoretical = float(np.sqrt(np.dot(optimal_weights.T, np.dot(cov_matrix, optimal_weights))))
        
        # Calculate risk decomposition
        risk_decomposition = RiskMetrics.calculate_risk_decomposition(returns, optimal_weights)
        
        # Calculate rolling metrics
        rolling_sharpe_30 = RiskMetrics.calculate_rolling_sharpe_ratio(portfolio_returns, window=30)
        rolling_sharpe_60 = RiskMetrics.calculate_rolling_sharpe_ratio(portfolio_returns, window=60)
        rolling_sharpe_90 = RiskMetrics.calculate_rolling_sharpe_ratio(portfolio_returns, window=90)
        rolling_vol_30 = RiskMetrics.calculate_rolling_volatility(portfolio_returns, window=30)
        rolling_vol_60 = RiskMetrics.calculate_rolling_volatility(portfolio_returns, window=60)
        rolling_vol_90 = RiskMetrics.calculate_rolling_volatility(portfolio_returns, window=90)
        
        rolling_metrics_data = {
            "sharpe_30": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_sharpe_30.items()
            ],
            "sharpe_60": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_sharpe_60.items()
            ],
            "sharpe_90": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_sharpe_90.items()
            ],
            "volatility_30": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_vol_30.items()
            ],
            "volatility_60": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_vol_60.items()
            ],
            "volatility_90": [
                {"date": str(date), "value": float(value)}
                for date, value in rolling_vol_90.items()
            ],
        }
        
        # Calculate portfolio ESG score (weighted average)
        portfolio_esg_score = None
        ticker_esg_scores_dict = None
        if esg_scores:
            # Calculate weighted average ESG score
            portfolio_esg = 0.0
            total_weight = 0.0
            ticker_esg_scores_dict = {}
            
            for ticker in request.tickers:
                if ticker in esg_scores:
                    ticker_esg_scores_dict[ticker] = float(esg_scores[ticker])
                    weight = weights_dict.get(ticker, 0.0)
                    portfolio_esg += abs(weight) * esg_scores[ticker]  # Use absolute weight
                    total_weight += abs(weight)
            
            if total_weight > 0:
                portfolio_esg_score = float(portfolio_esg / total_weight)
        
        response = PortfolioResponse(
            weights=weights_dict,
            expected_return=expected_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            calmar_ratio=calmar_ratio,
            max_drawdown=max_drawdown,
            total_leverage=total_leverage,
            price_history=price_history,
            portfolio_returns=portfolio_returns_data,
            correlation_matrix=correlation_matrix,
            efficient_frontier=efficient_frontier,
            rolling_metrics=rolling_metrics_data,
            risk_decomposition=risk_decomposition,
            esg_weight=float(esg_weight) if esg_weight > 0 else None,
            portfolio_esg_score=portfolio_esg_score,
            ticker_esg_scores=ticker_esg_scores_dict,
            expected_return_theoretical=expected_return_theoretical,
            volatility_theoretical=volatility_theoretical
        )
        
        logger.info(f"Optimization successful. Sharpe ratio: {sharpe_ratio:.2f}")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.get("/search/tickers", response_model=TickerSearchResponse)
async def search_tickers(q: str = Query(..., min_length=1, description="Search query for ticker symbol or company name")):
    """
    Search for tickers by symbol or company name.
    
    Args:
        q: Search query (ticker symbol or company name)
        
    Returns:
        List of matching tickers with company names
    """
    if not TICKER_DB:
        return TickerSearchResponse(results=[])
    
    query = q.upper().strip()
    results = []
    
    for ticker_info in TICKER_DB:
        symbol = ticker_info.get("symbol", "").upper()
        name = ticker_info.get("name", "").upper()
        
        # Match if query is in symbol or name
        if query in symbol or query in name:
            # Prioritize exact symbol matches
            score = 0
            if symbol == query:
                score = 100
            elif symbol.startswith(query):
                score = 50
            elif query in symbol:
                score = 30
            elif query in name:
                score = 20
            
            results.append({
                "symbol": ticker_info["symbol"],
                "name": ticker_info["name"],
                "_score": score
            })
    
    # Sort by score (exact matches first), then by symbol
    results.sort(key=lambda x: (-x["_score"], x["symbol"]))
    
    # Remove score before returning
    ticker_results = [TickerInfo(symbol=r["symbol"], name=r["name"]) for r in results[:20]]
    
    return TickerSearchResponse(results=ticker_results)


@app.get("/portfolio-presets")
async def get_portfolio_presets(category: str = Query(None, description="Filter presets by category")):
    """
    Get available portfolio presets.
    
    Args:
        category: Optional category filter (Tech, Finance, Healthcare, Energy, Consumer, ETFs, Diversified, ESG-focused)
        
    Returns:
        List of portfolio presets
    """
    if not PORTFOLIO_PRESETS:
        return {"presets": []}
    
    presets = PORTFOLIO_PRESETS
    if category:
        presets = [p for p in presets if p.get("category", "").lower() == category.lower()]
    
    return {"presets": presets}


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "endpoints": [
            "/",
            "/optimize",
            "/search/tickers",
            "/portfolio-presets",
            "/health",
            "/docs"
        ]
    }
