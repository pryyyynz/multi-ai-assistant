from fastapi import APIRouter, UploadFile, File, Form, status, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
import logging

from services.document_service import mcp_document_service, QueryRequest, DocumentContext, QueryResponse

# Configure logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()


@router.post("/upload-qa",
             summary="Upload documents for QA",
             description="Upload multiple documents (PDF, DOCX, PPT) for processing and question answering")
async def upload_documents(
    files: List[UploadFile] = File(...),
    context_id: Optional[str] = Form(
        None, description="Optional context ID for adding to existing context")
):
    """
    Upload multiple documents for processing and indexing.

    - **files**: List of files to upload (PDF, DOCX, DOC, PPTX, PPT)
    - **context_id**: Optional context ID to add documents to an existing context

    Returns a list of processing results for each file.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )

    results = []
    allowed_extensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt']

    # Use provided context_id or create a new one
    current_context_id = context_id

    # Check if context_id is valid (not "string" or empty)
    if not current_context_id or current_context_id == "string" or current_context_id.strip() == "":
        # Create a new context
        new_context = mcp_document_service.create_context()
        current_context_id = new_context.context_id
        logger.info(f"Created new context: {current_context_id}")
    else:
        # Verify the context exists
        context_exists = mcp_document_service.get_context(
            current_context_id) is not None
        if not context_exists:
            # If context doesn't exist, create a new one
            new_context = mcp_document_service.create_context()
            current_context_id = new_context.context_id
            logger.info(
                f"Created new context: {current_context_id} (previous context not found)")

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

            # Process the file using the MCP document service
            logger.info(
                f"Processing file: {filename} with context_id: {current_context_id}")
            upload_response = await mcp_document_service.process_file(
                file_content=file_content,
                filename=filename,
                context_id=current_context_id
            )

            # Add debug info to verify documents are being processed
            logger.info(
                f"File processed: {filename}, Success: {upload_response.success}, Document count: {upload_response.document_count}")

            results.append({
                "filename": filename,
                "success": upload_response.success,
                "message": upload_response.message
            })

        except Exception as e:
            logger.error(
                f"Error processing file {getattr(file, 'filename', 'unknown')}: {str(e)}")
            results.append({
                "filename": getattr(file, 'filename', 'unknown'),
                "success": False,
                "message": f"Error processing file: {str(e)}"
            })

    response_status = status.HTTP_207_MULTI_STATUS if any(
        not r["success"] for r in results) else status.HTTP_200_OK

    # Explicitly fetch the context state after processing all files
    context_state = mcp_document_service.get_context(current_context_id)

    # Default values
    document_count = 0
    has_vector_store = False

    if context_state:
        # Use context_state since it's the source of truth
        document_count = context_state["document_count"]
        # Explicitly check if vector_store exists and is not None
        has_vector_store = context_state["vector_store"] is not None

    # Log detailed context information
    logger.info(f"Upload complete for context {current_context_id}:")
    logger.info(f"Document count: {document_count}")
    logger.info(f"Has vector store: {has_vector_store}")

    return JSONResponse(
        status_code=response_status,
        content={
            "results": results,
            "context_info": {
                "document_count": document_count,
                "has_vector_store": has_vector_store,
                "context_id": current_context_id
            }
        }
    )


@router.post("/ask-qa",
             summary="Ask questions about documents",
             description="Ask a question about previously uploaded documents")
async def ask_question(
    question: str = Form(...),
    context_id: Optional[str] = Form(
        None, description="Context ID to query specific document set"),
    k: Optional[int] = Form(
        4, description="Number of relevant chunks to retrieve")
):
    """
    Ask a question about the uploaded documents.

    - **question**: The question to ask
    - **context_id**: Context ID to query a specific document set
    - **k**: Number of relevant document chunks to retrieve (default: 4)

    Returns an answer based on the document content.
    """
    try:
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

        # Check if context_id is valid (not "string" or empty)
        if context_id == "string" or (context_id and context_id.strip() == ""):
            logger.warning(f"Invalid context ID provided: {context_id}")
            # Create a new context as fallback
            new_context = mcp_document_service.create_context()
            context_id = new_context.context_id
            logger.info(
                f"Created new context due to invalid context ID: {context_id}")

            return {
                "answer": "Invalid context ID provided. Please upload documents to a valid context first.",
                "has_documents": False,
                "context_info": {
                    "document_count": 0,
                    "context_id": context_id
                },
                "sources": []
            }

        # Debug information
        logger.info(f"Ask question for context ID: {context_id}")

        # If context_id is provided, verify it exists
        if context_id:
            context = mcp_document_service.get_context(context_id)
            if not context:
                logger.warning(f"Context not found: {context_id}")
                # Create a new context as fallback
                new_context = mcp_document_service.create_context()
                context_id = new_context.context_id
                logger.info(f"Created new fallback context: {context_id}")

                return {
                    "answer": "The specified document context was not found. Please upload documents first.",
                    "has_documents": False,
                    "context_info": {
                        "document_count": 0,
                        "context_id": context_id
                    },
                    "sources": []
                }

        # Create query request
        query_request = QueryRequest(
            question=question,
            context_id=context_id,
            k=k
        )

        # Process question using the MCP document service
        response = await mcp_document_service.query(query_request)

        # Log debug information
        logger.info(
            f"Query response: context_id={response.context_id}, has_documents={response.has_documents}, document_count={response.document_count}")

        # Format response
        return {
            "answer": response.answer,
            "has_documents": response.has_documents,
            "context_info": {
                "document_count": response.document_count,
                "context_id": response.context_id
            },
            "sources": response.sources
        }

    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )


@router.get("/status",
            summary="Check document context status",
            description="Check if documents have been uploaded and indexed for a specific context")
async def get_status(
    context_id: Optional[str] = None
):
    """
    Check the status of the document context.

    - **context_id**: Optional context ID to check status for

    Returns information about whether documents have been uploaded and indexed.
    """
    try:
        # If no context ID provided, list all available contexts
        if not context_id:
            contexts = mcp_document_service.list_contexts()
            return {
                "available_contexts": [
                    {
                        "context_id": ctx.context_id,
                        "document_count": ctx.document_count,
                        "has_documents": ctx.has_vector_store
                    } for ctx in contexts
                ],
                "message": f"Found {len(contexts)} active document contexts"
            }

        # Check specific context status
        context_state = mcp_document_service.get_context(context_id)
        if not context_state:
            return {
                "status": "not_found",
                "has_documents": False,
                "message": f"Context ID '{context_id}' not found"
            }

        has_documents = context_state["vector_store"] is not None
        document_count = context_state["document_count"]

        logger.info(f"Status check for context ID: {context_id}")
        logger.info(
            f"Has documents: {has_documents}, Document count: {document_count}")

        return {
            "status": "ready" if has_documents else "no_documents",
            "has_documents": has_documents,
            "context_info": {
                "document_count": document_count,
                "context_id": context_id,
                "sources": context_state["sources"]
            },
            "message": f"{document_count} documents are indexed and ready for queries" if has_documents
            else "No documents have been uploaded yet to this context"
        }

    except Exception as e:
        logger.error(f"Error checking context status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking context status: {str(e)}"
        )


@router.post("/reset",
             summary="Reset a document context",
             description="Delete all documents from a specific context")
async def reset_context(
    context_id: str = Form(...)
):
    """
    Reset a document context by deleting all documents.

    - **context_id**: Context ID to reset
    """
    try:
        # Delete the context
        success = mcp_document_service.delete_context(context_id)

        if not success:
            return {
                "success": False,
                "message": f"Context '{context_id}' not found"
            }

        # Create a new context with the same ID
        new_context = mcp_document_service.create_context()

        return {
            "success": True,
            "message": "Context has been reset. All documents have been removed.",
            "context_info": {
                "document_count": 0,
                "context_id": new_context.context_id
            }
        }

    except Exception as e:
        logger.error(f"Error resetting context: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resetting context: {str(e)}"
        )
