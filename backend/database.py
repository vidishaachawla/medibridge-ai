import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError(
        "\n\n"
        "  ╔══════════════════════════════════════════════════════════════╗\n"
        "  ║  STARTUP ERROR: DATABASE_URL is not set                     ║\n"
        "  ╠══════════════════════════════════════════════════════════════╣\n"
        "  ║  1. Open: medibridge-ai\\backend\\.env                        ║\n"
        "  ║  2. Set:  DATABASE_URL=postgresql://user:pass@host/db?ssl... ║\n"
        "  ║  3. Get your connection string from: console.neon.tech       ║\n"
        "  ╚══════════════════════════════════════════════════════════════╝\n"
    )

# Neon PostgreSQL requires sslmode=require for secure connections.
# Ensure the engine is configured to prevent idle connection dropouts common in serverless DBs.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Check connection health before using
    pool_recycle=300,    # Recycle connections after 5 minutes
    pool_size=5,         # Limit connection pool size
    max_overflow=10      # Max extra connections
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get db session in FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
