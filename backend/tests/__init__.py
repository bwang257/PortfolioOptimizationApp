from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PortfolioRequest, PortfolioResponse
from .data_loader import DataLoader
from .optimizer import PortfolioOptimizer
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Portfolio Optimization API",
    description="API for optimizing stock portfolios using various risk-adjusted metrics",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "portfolio-optimization-api"}


@app.post("/optimize-portfolio", response_model=PortfolioResponse)
async def optimize_portfolio(request: PortfolioRequest):
    """
    Optimize portfolio weights based on given objective and constraints.
    
    Args:
        request: Portfolio optimization request
        
    Returns:
        PortfolioResponse with optimal weights and metrics
    """
    try:
        logger.info(f"Optimizing portfolio for {len(request.tickers)} tickers")
        
        # Fetch and prepare data
        data_loader = DataLoader(lookback_days=request.lookback_days)
        prices = data_loader.fetch_prices(request.tickers)
        returns = data_loader.compute_returns(prices)
        
        # Get valid tickers (some may have been filtered out)
        valid_tickers = list(prices.columns)
        
        if len(valid_tickers) < len(request.tickers):
            logger.warning(f"Some tickers were filtered: {set(request.tickers) - set(valid_tickers)}")
        
        # Optimize
        optimizer = PortfolioOptimizer(
            returns=returns,
            objective=request.objective,
            portfolio_type=request.portfolio_type
        )
        
        optimal_weights, metrics = optimizer.optimize()
        
        # Convert weights to dictionary
        weights_dict = dict(zip(valid_tickers, optimal_weights))
        
        # Build response
        response = PortfolioResponse(
            weights=weights_dict,
            expected_return=metrics["expected_return"],
            volatility=metrics["volatility"],
            sharpe_ratio=metrics.get("sharpe_ratio"),
            sortino_ratio=metrics.get("sortino_ratio"),
            calmar_ratio=metrics.get("calmar_ratio"),
            max_drawdown=metrics.get("max_drawdown"),
            total_leverage=metrics.get("total_leverage")
        )
        
        logger.info(f"Optimization complete. Sharpe: {response.sharpe_ratio:.3f}")
        return response
        
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)