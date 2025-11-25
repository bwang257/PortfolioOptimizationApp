# Portfolio Optimization Web App

A production-ready web application for optimizing stock portfolios using various risk-adjusted metrics (Sharpe, Sortino, Calmar ratios).

## 🏗 Architecture

- **Backend**: FastAPI (Python) - Portfolio optimization engine
- **Frontend**: Next.js 14 (TypeScript) - React-based UI
- **Data Source**: yfinance (modular design allows easy replacement)
- **Optimization**: scipy.optimize with custom objective functions

## 📋 Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

## 🚀 Quick Start

### Backend Setup

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000The API will be available at `http://localhost:8000`

### Frontend Setup

cd frontend
npm install
npm run devThe app will be available at `http://localhost:3000`

## 🧪 Testing

cd backend
pytest tests/## 📡 API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
{
  "status": "healthy",
  "service": "portfolio-optimization-api"
}### `POST /optimize-portfolio`
Optimize portfolio weights.

**Request:**
{
  "tickers": ["AAPL", "MSFT", "NVDA"],
  "objective": "sharpe",
  "portfolio_type": "long_only",
  "lookback_days": 252
}**Response:**son
{
  "weights": {"AAPL": 0.25, "MSFT": 0.45, "NVDA": 0.30},
  "expected_return": 0.15,
  "volatility": 0.20,
  "sharpe_ratio": 0.75,
  "sortino_ratio": 1.10,
  "calmar_ratio": 2.50,
  "max_drawdown": 0.06,
  "total_leverage": null
}
## 🎯 Features

- **Multiple Objectives**: Sharpe, Sortino, Calmar ratios
- **Portfolio Types**: Long-only or Long/Short with leverage cap
- **Data Validation**: Automatic filtering of invalid tickers
- **Visualization**: Interactive charts and metrics tables
- **Responsive Design**: Works on desktop and mobile

## 📁 Project Structure
