from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection, get_database
from routes import router as notes_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting up NoteTaker API...")
    await connect_to_mongo(settings.mongodb_url, settings.database_name)
    yield
    # Shutdown
    logger.info("Shutting down NoteTaker API...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="NoteTaker API",
    description="Backend API for NoteTaker app - saves notes to MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes_router)


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "NoteTaker API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "notes": "/api/notes",
            "sync": "/api/notes/sync"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint with live MongoDB ping"""
    try:
        database = get_database(settings.database_name)
        await database.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as error:
        logger.error(f"Health check failed: {error}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected"}
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development"
    )
