from fastapi import APIRouter, HTTPException, Form, UploadFile, File, Depends
from typing import Optional
from pydantic import BaseModel

from services.cover_letter_service import generate_cover_letter_from_cv_file
from services.api_key_validation import get_groq_api_key

cover_letter_router = APIRouter(tags=["Cover Letter"])

class CoverLetterResponse(BaseModel):
    cover_letter: str
    extracted_info: dict
    cv_text: str

@cover_letter_router.post("/generate-cover-letter", response_model=CoverLetterResponse)
async def create_cover_letter(
    cv_file: UploadFile = File(...),
    applying_role: str = Form(...),
    company_name: str = Form(...),
    tone: str = Form("professional"),
    additional_instructions: Optional[str] = Form(None),
    groq_api_key: str = Depends(get_groq_api_key)
):
    """
    Generate a personalized cover letter based on an uploaded CV file (PDF or DOCX)
    """
    # Validate file extension
    allowed_extensions = [".pdf", ".docx", ".doc"]
    file_extension = "." + cv_file.filename.split(".")[-1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {file_extension}. Please upload a PDF or Word document."
        )
    
    try:
        cover_letter, extracted_info, cv_text = await generate_cover_letter_from_cv_file(
            cv_file.file,
            cv_file.filename,
            applying_role,
            company_name,
            tone,
            additional_instructions,
            groq_api_key
        )
        return CoverLetterResponse(
            cover_letter=cover_letter, 
            extracted_info=extracted_info,
            cv_text=cv_text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate cover letter: {str(e)}")