from sqlalchemy import create_engine, Column, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import logging
from typing import Generator
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

load_dotenv()

# Get the DATABASE_URL from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in environment variables")

# Log the connection (hiding password)
log_safe_url = DATABASE_URL.replace(
    DATABASE_URL.split(":", 2)[2].split("@")[0],
    "********"
)
logger.info(f"Using PostgreSQL database: {log_safe_url}")

# Create SQLAlchemy engine with production settings
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Don't echo SQL in production
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connection before using from pool
    pool_recycle=3600   # Recycle connections after 1 hour
)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get the database session


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
