from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PortfolioRequest, PortfolioResponse
from .data_loader import DataLoader
from .optimizer import PortfolioOptimizer
from .metrics import RiskMetrics
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        # Optimize portfolio
        optimizer = PortfolioOptimizer(
            returns=returns,
            objective=request.objective,
            portfolio_type=request.portfolio_type
        )
        optimal_weights, metrics = optimizer.optimize()
        
        # Convert weights array to dictionary
        weights_dict = {ticker: float(weight) for ticker, weight in zip(request.tickers, optimal_weights)}
        
        # Calculate portfolio returns for additional metrics
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
        
        response = PortfolioResponse(
            weights=weights_dict,
            expected_return=expected_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            calmar_ratio=calmar_ratio,
            max_drawdown=max_drawdown,
            total_leverage=total_leverage
        )
        
        logger.info(f"Optimization successful. Sharpe ratio: {sharpe_ratio:.2f}")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "api_version": "1.0.0",
        "endpoints": [
            "/",
            "/optimize",
            "/health",
            "/docs"
        ]
    }
