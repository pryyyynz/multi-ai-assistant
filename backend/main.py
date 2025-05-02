import os
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import logging
import asyncio
from datetime import datetime

from services.document_service import session_manager, get_session_service, DocumentQAService
from routes.documents_qa import router as document_qa_router, SessionMiddleware
from routes.cover_letter import cover_letter_router
from services.api_key_validation import get_groq_api_key
from services.job_matching_service import JobMatchingService
from routes import cv_analyzer
from routes import chat_router
from services.rag_service import RAGService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize legacy service for backward compatibility
legacy_document_service = DocumentQAService("global")

# Session cleanup task running flag
cleanup_task_running = False
cleanup_task = None

async def periodic_cleanup():
    """Background task to clean up expired sessions periodically"""
    global cleanup_task_running
    try:
        while cleanup_task_running:
            logger.info("Running scheduled cleanup of expired sessions")
            session_manager.cleanup_expired_sessions()
            # Wait for 1 hour before next cleanup
            await asyncio.sleep(3600)  # 60 minutes in seconds
    except Exception as e:
        logger.error(f"Error in periodic cleanup task: {str(e)}")
    finally:
        logger.info("Session cleanup task stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    global cleanup_task_running, cleanup_task
    # Initialize services on startup
    logger.info("Starting Multi AI API")
    
    # Check environment variables
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY environment variable not set")
    
    # Start the cleanup background task
    cleanup_task_running = True
    cleanup_task = asyncio.create_task(periodic_cleanup())
    
    yield
    
    # Clean up on shutdown
    logger.info("Shutting down Multi AI API")
    
    # Stop the cleanup task
    cleanup_task_running = False
    if cleanup_task:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass

app = FastAPI(lifespan=lifespan, title="Multi AI API")

# Add CORS middleware to allow your frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Token"]  # Expose session token header for clients
)

# Add session middleware
app.add_middleware(SessionMiddleware)

# Add a route to manually trigger session cleanup (for testing purposes)
@app.get("/api/admin/cleanup-sessions", include_in_schema=False)
async def trigger_session_cleanup(background_tasks: BackgroundTasks):
    """Manually trigger session cleanup (admin use only)"""
    try:
        background_tasks.add_task(session_manager.cleanup_expired_sessions)
        return {"message": "Session cleanup triggered"}
    except Exception as e:
        logger.error(f"Error triggering session cleanup: {str(e)}")
        return {"error": str(e)}

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    # Initialize job matching service and preload embeddings
    job_service = JobMatchingService()
    await job_service.initialize_embeddings()
    
    # Create a global session for backward compatibility
    global_session_id = session_manager.create_session()
    global_service = session_manager.get_session(global_session_id)["document_service"]
    
    # Register the global service for other routes to use
    from services.document_service import service_registry
    service_registry.register_service("global_document_service", global_service)
    logger.info("Global document service initialized and registered")

# Update the get_document_service dependency to use the registry
def get_document_service():
    from services.document_service import service_registry
    return service_registry.get_service("global_document_service")

# Include routers
# 1. Session-based document Q&A router
app.include_router(
    document_qa_router,
    tags=["Document Q&A"]
)
# 2. Cover letter router
app.include_router(
    cover_letter_router,
    dependencies=[Depends(get_groq_api_key)]
)
# 3. CV analyzer router
app.include_router(
    cv_analyzer.router, 
    tags=["CV Analysis"]
)
# 4. chatbot router
app.include_router(
    chat_router.router,
    prefix="/ghana",  # Add a prefix to avoid route collisions
    tags=["Ghana LLM"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=80, reload=True)