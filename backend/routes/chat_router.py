from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, UploadFile, File
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from services.rag_service import RAGService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the router
router = APIRouter(
    responses={404: {"description": "Not found"}},
)

# Create a global instance of the RAG service
rag_service = RAGService()

# Pydantic models for request and response validation
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []
    search_results: bool = False

class DocumentTextRequest(BaseModel):
    text: str
    source: Optional[str] = "manual_input"

class DocumentResponse(BaseModel):
    success: bool
    message: str
    chunks: int = 0

def get_rag_service():
    """Dependency to get the RAG service instance"""
    return rag_service

@router.post("/query", response_model=ChatResponse)
async def query_chatbot(request: ChatRequest, rag_service: RAGService = Depends(get_rag_service)):
    """
    Query the chatbot with a message
    """
    try:
        # Generate response
        response = rag_service.generate_response(request.message)
        
        return ChatResponse(
            answer=response["answer"],
            sources=response["sources"],
            search_results=response["search_results"]
        )
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")
    
@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Upload a document to the RAG system
    """
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads", exist_ok=True)
        
        # Save the file
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process the document in the background
        def process_doc():
            try:
                docs = rag_service.load_documents([file_path])
                rag_service.process_documents(docs)
                logger.info(f"Successfully processed document {file.filename}")
            except Exception as e:
                logger.error(f"Error processing document: {str(e)}")
        
        background_tasks.add_task(process_doc)
        
        return DocumentResponse(
            success=True,
            message=f"Document {file.filename} uploaded and queued for processing",
        )
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@router.post("/text", response_model=DocumentResponse)
async def add_document_text(
    request: DocumentTextRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Add document text directly to the RAG system
    """
    try:
        # Add the text as a document
        chunks = rag_service.add_document_from_text(request.text, request.source)
        
        return DocumentResponse(
            success=True,
            message=f"Text added successfully as document from source '{request.source}'",
            chunks=chunks
        )
    except Exception as e:
        logger.error(f"Error adding document text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding document text: {str(e)}")