from fastapi import FastAPI
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection, get_database
from routes import router as notes_router
from folder_routes import router as folders_router

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
# Disable docs/redoc/openapi in production to hide API schema from public
is_production = settings.environment == "production"

app = FastAPI(
    title="NoteTaker API",
    description="Backend API for NoteTaker app - saves notes to MongoDB",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

# Include routers
app.include_router(notes_router)
app.include_router(folders_router)


@app.get("/")
async def root():
    """Root endpoint - API info"""
    response = {
        "name": "NoteTaker API",
        "version": "1.0.0",
        "status": "running",
    }

    # Only show docs link and endpoint details in development
    if not is_production:
        response["docs"] = "/docs"
        response["endpoints"] = {
            "notes": "/api/notes",
            "sync": "/api/notes/sync"
        }

    return response


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
