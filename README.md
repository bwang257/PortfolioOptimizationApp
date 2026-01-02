# Portfolio Optimization App

A production-ready full-stack application designed to democratize institutional-grade portfolio construction. It utilizes Modern Portfolio Theory (MPT) to generate optimal asset allocations based on user-selected risk objectives (Sharpe, Sortino, Calmar, and Min-Variance).

Live Deployment: https://portfolio-optimization-app.vercel.app

## Architecture

- **Backend**: FastAPI (Python) - Portfolio optimization engine
- **Frontend**: Next.js 14 (TypeScript) - React-based UI
- **Data Source**: yfinance (modular design allows easy replacement)
- **Optimization**: scipy.optimize with custom objective functions

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

### `GET /`
Health check endpoint.

**Response:**
```json
{
  "message": "Portfolio Optimization API is running",
  "status": "healthy",
  "version": "1.0.0"
}
```

### `GET /search/tickers?q={query}`
Search for stock tickers by symbol or company name.

**Query Parameters:**
- `q` (string): Search query (ticker symbol or company name)

**Response:**
```json
{
  "results": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc."
    }
  ]
}
```

### `POST /optimize`
Optimize portfolio weights.

**Request:**
```json
{
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "objective": "sharpe",
  "portfolio_type": "long_only",
  "lookback_days": 252
}
```

**Response:**
```json
{
  "weights": {"AAPL": 0.25, "MSFT": 0.45, "NVDA": 0.30},
  "expected_return": 0.15,
  "volatility": 0.20,
  "sharpe_ratio": 0.75,
  "sortino_ratio": 1.10,
  "calmar_ratio": 2.50,
  "max_drawdown": 0.06,
  "total_leverage": null,
  "price_history": {...},
  "portfolio_returns": [...],
  "efficient_frontier": [...],
  "rolling_metrics": {...},
  "risk_decomposition": {...}
}
```

## Features

- **Multiple Objectives**: Sharpe, Sortino, Calmar ratios, and Minimum Variance
- **Portfolio Types**: Long-only or Long/Short with leverage cap
- **Data Validation**: Automatic filtering of invalid tickers
- **Visualization**: Interactive charts and metrics tables
- **Responsive Design**: Works on desktop and mobile
- **Efficient Frontier**: Visual representation of optimal portfolios
- **Rolling Metrics**: Time-series analysis of Sharpe ratio and volatility
- **Risk Decomposition**: Breakdown of risk contribution by asset

## 📁 Project Structure

```
PortfolioOptimization/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── data_loader.py    # Data fetching and processing
│   │   ├── optimizer.py      # Portfolio optimization logic
│   │   ├── metrics.py         # Risk metrics calculations
│   │   └── schemas.py        # Pydantic models
│   ├── data/
│   │   ├── tickers.json      # Ticker database
│   │   └── portfolio_presets.json  # Predefined portfolios
│   ├── tests/                # Test suite
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── app/                  # Next.js app directory
│   │   ├── page.tsx          # Home page
│   │   ├── optimize/         # Optimization page
│   │   └── results/         # Results page
│   ├── components/           # React components
│   ├── lib/                  # Utilities and API client
│   └── package.json         # Node.js dependencies
└── README.md
```


## License

This project is open source and available for personal and commercial use.
