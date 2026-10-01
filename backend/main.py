from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import config
from database import Base, engine
from routes import recipes, chat, pantry, favorites, meal_planner

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="ChefMate AI API",
    description="Backend API for ChefMate AI cooking assistant powered by Google Gemini",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler for unhandled exceptions to prevent exposing internals
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected server error occurred: {str(exc)}"}
    )

# Include API Routers
app.include_router(recipes.router)
app.include_router(chat.router)
app.include_router(pantry.router)
app.include_router(favorites.router)
app.include_router(meal_planner.router)

@app.get("/")
def root():
    return {
        "app": "ChefMate AI API",
        "status": "healthy",
        "gemini_configured": config.is_gemini_configured(),
        "model": config.GEMINI_MODEL
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "gemini_configured": config.is_gemini_configured(),
        "model": config.GEMINI_MODEL
    }
