from database.database import Base, engine
import logging

# Import all models to ensure they're registered with SQLAlchemy
from database.models import User
from routes.feedback import Feedback

logger = logging.getLogger(__name__)


def init_db():
    """Initialize the database and create all tables"""
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}")
        raise
