import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from services.document_service import DocumentQAService
from routes.documents_qa import router
from routes.cover_letter import cover_letter_router
from services.api_key_validation import get_groq_api_key
from services.job_matching_service import JobMatchingService
from routes import cv_analyzer
from routes import chat_router
from services.rag_service import RAGService

# Load environment variables
load_dotenv()

# Initialize service
document_service = DocumentQAService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize service on startup
    yield
    # Clean up on shutdown
    # No cleanup needed for now

app = FastAPI(lifespan=lifespan, title="Multi AI API")

# Add CORS middleware to allow your frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    # Initialize the Groq client
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    
    # Initialize job matching service and preload embeddings
    job_service = JobMatchingService()
    await job_service.initialize_embeddings()

# Dependency to get the document service
def get_document_service():
    return document_service

# Include routers
app.include_router(
    router,
    tags=["Document Q&A"],
    dependencies=[Depends(get_document_service)]
)

app.include_router(
    cover_letter_router,
    dependencies=[Depends(get_groq_api_key)]
)

# Include CV analyzer router
app.include_router(
    cv_analyzer.router, 
    tags=["CV Analysis"]
)

# Include Ghana LLM router - remove duplicate "chat" tag
app.include_router(
    chat_router.router,
    prefix="/ghana",  # Add a prefix to avoid route collisions
    tags=["Ghana LLM"]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=80, reload=True)