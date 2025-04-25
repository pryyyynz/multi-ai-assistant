import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from services.document_service import DocumentQAService
from routes.documents_qa import router
from routes.cover_letter import cover_letter_router
from services.api_key_validation import validate_api_key

# Load environment variables
load_dotenv()

# Get API keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable must be set")

# Initialize service
document_service = DocumentQAService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize service on startup
    yield
    # Clean up on shutdown
    # No cleanup needed for now

app = FastAPI(lifespan=lifespan, title="Document Q&A API")

# Add CORS middleware to allow your frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the document service
def get_document_service():
    return document_service

# Include routers
app.include_router(
    router,
    dependencies=[Depends(get_document_service)]
)

app.include_router(
    cover_letter_router,
    dependencies=[Depends(validate_api_key)]
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)