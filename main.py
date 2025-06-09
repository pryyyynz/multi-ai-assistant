import os
from fastapi import FastAPI, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import logging
import asyncio
from datetime import datetime

from routes.documents_qa import router as document_qa_router
from routes.cover_letter import cover_letter_router
# Authentication and feedback routers removed for deployment
# from routes.auth_router import router as auth_router
# from routes.feedback import router as feedback_router
from services.api_key_validation import get_groq_api_key
from services.job_matching_service import JobMatchingService
from routes import cv_analyzer
from routes import chat_router
from services.rag_service import RAGService
from database.init_db import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize services on startup
    logger.info("Starting Multi AI API")

    # Initialize database first
    logger.info("Initializing database from lifespan context manager")
    init_db()

    # Check environment variables
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY environment variable not set")

    yield

    # Clean up on shutdown
    logger.info("Shutting down Multi AI API")

app = FastAPI(lifespan=lifespan, title="Multi AI API")

# Add CORS middleware to allow your frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Context-ID"]  # Expose context ID header for clients
)

# Initialize services on startup


@app.on_event("startup")
async def startup_event():
    # Initialize job matching service and preload embeddings
    job_service = JobMatchingService()
    await job_service.initialize_embeddings()
    logger.info("Job matching service initialized")

# Include routers
# 1. Document Q&A router using MCP architecture
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
# Authentication and feedback routers removed for deployment
# 5. Authentication router
# app.include_router(
#     auth_router,
#     tags=["Authentication"]
# )
# 6. Feedback router
# app.include_router(
#     feedback_router,
#     tags=["Feedback"]
# )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=80, reload=True)
