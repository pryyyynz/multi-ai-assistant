from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import List
import io

from services.document_service import DocumentQAService

router = APIRouter()

def get_document_service(service: DocumentQAService = Depends()):
    return service

@router.post("/upload")
async def upload_documents(
    files: List[UploadFile] = File(...),
    service: DocumentQAService = Depends(get_document_service)
):
    """
    Upload multiple documents (PDF, DOCX, PPT) for processing
    """
    results = []
    
    for file in files:
        # Validate file extensions
        filename = file.filename
        if not filename:
            continue
            
        allowed_extensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt']
        file_ext = '.' + filename.split('.')[-1].lower()
        
        if file_ext not in allowed_extensions:
            results.append({
                "filename": filename,
                "success": False,
                "message": f"Unsupported file format. Please upload PDF, Word, or PowerPoint files."
            })
            continue
            
        # Read file content
        file_content = await file.read()
        
        # Process the file
        success = await service.process_file(file_content, filename)
        
        results.append({
            "filename": filename,
            "success": success,
            "message": "File processed successfully" if success else "Failed to process file"
        })
    
    return JSONResponse(content={"results": results})

@router.post("/ask")
async def ask_question(
    question: str = Form(...),
    service: DocumentQAService = Depends(get_document_service)
):
    """
    Ask a question about the uploaded documents
    """
    if not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
        
    response = await service.query_documents(question)
    return response