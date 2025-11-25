Backend: 

# Navigate to backend directory
cd backend

# Activate the virtual environment (if not already activated)
source venv/bin/activate 

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000

Frontend: 
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the development server
npm run dev