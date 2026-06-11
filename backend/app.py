import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# CRITICAL: load_dotenv() MUST run before any local module imports
# because database.py reads DATABASE_URL at import time.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# Import database engine and Base to initialize tables
from database import engine, Base
# Import routers
from routes import patients, clinical, fhir, audit, analytics

# Modern FastAPI lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables in Neon PostgreSQL if they do not exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: Clean up resources (if any)
    pass

# Initialize FastAPI with metadata
app = FastAPI(
    title="MediBridge AI Backend",
    description="Production-ready clinical AI middleware and FHIR orchestration server. Provides interfaces to Neon PostgreSQL, Mistral AI, and HL7 FHIR structures.",
    version="1.0.0",
    contact={
        "name": "MediBridge AI Team",
        "email": "support@medibridge.ai",
    },
    license_info={
        "name": "MIT License",
    },
    lifespan=lifespan
)

# Configure CORS Middleware
# NOTE: allow_credentials=True is incompatible with allow_origins=["*"] in Starlette.
# Use explicit origins for credentials. For local dev, wildcard without credentials is fine.
IS_DEVELOPMENT = os.getenv("ENVIRONMENT", "production").lower() == "development"

if IS_DEVELOPMENT:
    # Local dev: allow all origins, no credentials flag (avoids Starlette validation error)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Production: explicit frontend origin with credentials enabled
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register API routers with '/api' prefixes
app.include_router(patients.router, prefix="/api")
app.include_router(clinical.router, prefix="/api")
app.include_router(fhir.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

# Base index route
@app.get("/", tags=["Health"])
def index():
    """
    Root index route returning basic server metadata.
    """
    return {
        "app": "MediBridge AI API Server",
        "version": "1.0.0",
        "documentation": "/docs"
    }

# Dedicated health check route (for Render / status monitors)
@app.get("/health", tags=["Health"])
def health_check():
    """
    Dedicated health check route to verify api server availability and database connectivity status.
    """
    db_status = "Connected"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"
    return {
        "status": "healthy" if "Disconnected" not in db_status else "unhealthy",
        "database": db_status,
        "environment": os.getenv("ENVIRONMENT", "production")
    }

if __name__ == "__main__":
    import uvicorn
    # Render sets the PORT environment variable. Fallback to 8000 for local development.
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=debug
    )
