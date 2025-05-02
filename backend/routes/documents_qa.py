# Fixed documents_qa.py
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, status, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from typing import List, Optional, Tuple
import logging

from services.document_service import get_session_service, DocumentQAService, session_manager, service_registry

# Configure logging
logger = logging.getLogger(__name__)

# Session token header name
SESSION_TOKEN_HEADER = "X-Session-Token"

# Middleware to handle session tokens
class SessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract session token from header if it exists
        session_token = request.headers.get(SESSION_TOKEN_HEADER)
        
        # Store the original session token in request.state for later use
        if session_token:
            request.state.original_session_token = session_token
        
        response = await call_next(request)
        
        # Check if we have a session token in the request state
        if hasattr(request.state, "session_token"):
            # Add the session token to the response headers
            response.headers[SESSION_TOKEN_HEADER] = request.state.session_token
            
            # If this is a new session, store it in a cookie as well for cross-endpoint sharing
            if (not hasattr(request.state, "original_session_token") or 
                request.state.session_token != request.state.original_session_token):
                response.set_cookie(
                    "session_token", 
                    request.state.session_token, 
                    httponly=True,
                    max_age=86400  # 24 hours
                )
            
        return response

router = APIRouter()

# Helper to set the session token in request state
async def set_session_token(
    request: Request,
    service_and_token: Tuple[DocumentQAService, str] = Depends(get_session_service)
):
    service, token = service_and_token
    request.state.session_token = token
    return service  # Return just the service

@router.post("/upload-qa", 
             summary="Upload documents for QA",
             description="Upload multiple documents (PDF, DOCX, PPT) for processing and question answering")
async def upload_documents(
    request: Request,
    files: List[UploadFile] = File(...),
    service: DocumentQAService = Depends(set_session_token)
):
    """
    Upload multiple documents for processing and indexing.
    
    - **files**: List of files to upload (PDF, DOCX, DOC, PPTX, PPT)
    
    Returns a list of processing results for each file.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
        
    results = []
    allowed_extensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt']
    
    for file in files:
        try:
            # Validate file extensions
            filename = file.filename
            if not filename:
                logger.warning("Filename is missing")
                results.append({
                    "filename": "unknown",
                    "success": False,
                    "message": "Missing filename"
                })
                continue
                
            file_ext = '.' + filename.split('.')[-1].lower()
            
            if file_ext not in allowed_extensions:
                logger.warning(f"Unsupported file format: {file_ext}")
                results.append({
                    "filename": filename,
                    "success": False,
                    "message": f"Unsupported file format. Please upload PDF, Word, or PowerPoint files."
                })
                continue
                
            # Read file content
            file_content = await file.read()
            
            if not file_content:
                logger.warning(f"Empty file: {filename}")
                results.append({
                    "filename": filename,
                    "success": False,
                    "message": "File is empty"
                })
                continue
                
            # Process the file
            logger.info(f"Processing file: {filename}")
            success = await service.process_file(file_content, filename)
            
            # Add debug info to verify documents are being processed
            logger.info(f"File processed: {filename}, Success: {success}, Document count: {service.get_document_count()}")
            
            results.append({
                "filename": filename,
                "success": success,
                "message": "File processed successfully" if success else "Failed to process file"
            })
            
        except Exception as e:
            logger.error(f"Error processing file {getattr(file, 'filename', 'unknown')}: {str(e)}")
            results.append({
                "filename": getattr(file, 'filename', 'unknown'),
                "success": False,
                "message": f"Error processing file: {str(e)}"
            })
    
    response_status = status.HTTP_207_MULTI_STATUS if any(not r["success"] for r in results) else status.HTTP_200_OK
    
    # Debug info in response
    document_count = service.get_document_count()
    has_vector_store = service.vector_store is not None
    
    return JSONResponse(
        status_code=response_status,
        content={
            "results": results,
            "session_info": {
                "document_count": document_count,
                "has_vector_store": has_vector_store
            }
        }
    )

@router.post("/ask-qa",
             summary="Ask questions about documents",
             description="Ask a question about previously uploaded documents")
async def ask_question(
    request: Request,
    question: str = Form(...),
    k: Optional[int] = Form(4, description="Number of relevant chunks to retrieve")
):
    """
    Ask a question about the uploaded documents.
    
    - **question**: The question to ask
    - **k**: Number of relevant document chunks to retrieve (default: 4)
    
    Returns an answer based on the document content.
    """
    try:
        # Get session token from header first
        session_token = request.headers.get(SESSION_TOKEN_HEADER)
        
        # If not in header, try from cookie
        if not session_token:
            session_token = request.cookies.get("session_token")
            logger.info(f"Retrieved session token from cookie: {session_token}")
        
        # Get the document service based on the session token
        if session_token:
            # First try to get from session manager
            session = session_manager.get_session(session_token)
            if session:
                service = session["document_service"]
                logger.info(f"Found service for session: {session_token}")
            else:
                # Try registry as fallback
                service = service_registry.get_service(f"document_service_{session_token}")
                logger.info(f"Found service in registry for session: {session_token}")
        else:
            # Use global service as fallback
            service = service_registry.get_service("global_document_service")
            logger.info("Using global document service as fallback")
            
        if not service:
            logger.warning("No document service found, creating new session")
            session_token = session_manager.create_session()
            session = session_manager.get_session(session_token)
            service = session["document_service"]
            request.state.session_token = session_token  # Set for middleware to handle
        
        # Validate inputs
        if not question.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Question cannot be empty"
            )
            
        if k <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parameter 'k' must be greater than 0"
            )
        
        # Debug information
        logger.info(f"Ask question for session token: {session_token}")
        logger.info(f"Vector store exists: {service.vector_store is not None}")
        logger.info(f"Document count: {service.get_document_count()}")
        
        # Check if documents have been uploaded
        if service.vector_store is None:
            logger.warning("Question asked but no documents have been uploaded")
            return {
                "answer": "No documents have been uploaded yet. Please upload documents before asking questions.",
                "has_documents": False,
                "session_info": {
                    "document_count": 0
                }
            }
            
        # Process question
        logger.info(f"Processing question: {question[:50]}{'...' if len(question) > 50 else ''}")
        response = await service.query_documents(question, k)
        
        # Add document count and session token
        response["session_info"] = {
            "document_count": service.get_document_count(),
            "session_token": session_token
        }
        
        # Set session token for middleware to handle
        request.state.session_token = session_token
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )
        
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )

@router.get("/status", 
            summary="Check document service status",
            description="Check if documents have been uploaded and indexed")
async def get_status(
    request: Request,
    service: DocumentQAService = Depends(set_session_token)
):
    """
    Check the status of the document service for the current session.
    
    Returns information about whether documents have been uploaded and indexed.
    """
    try:
        has_documents = service.vector_store is not None
        document_count = service.get_document_count()
        
        logger.info(f"Status check for session token: {request.state.session_token}")
        logger.info(f"Has documents: {has_documents}, Document count: {document_count}")
        
        return {
            "status": "ready" if has_documents else "no_documents",
            "has_documents": has_documents,
            "session_info": {
                "document_count": document_count
            },
            "message": f"{document_count} documents are indexed and ready for queries" if has_documents 
                      else "No documents have been uploaded yet"
        }
        
    except Exception as e:
        logger.error(f"Error checking service status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking service status: {str(e)}"
        )

@router.post("/reset",
             summary="Reset the current session",
             description="Delete all documents and reset the current session")
async def reset_session(
    request: Request,
    service: DocumentQAService = Depends(set_session_token)
):
    """
    Reset the current session by deleting all documents.
    """
    try:
        # Actually perform the reset by cleaning up the service
        service.cleanup()
        
        # The middleware will handle sending the new session token
        return {
            "success": True,
            "message": "Session has been reset. All documents have been removed.",
            "session_info": {
                "document_count": 0
            }
        }
        
    except Exception as e:
        logger.error(f"Error resetting session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting session: {str(e)}"
        )