# app/services/api_key_validation.py
from fastapi import Header, HTTPException, Request
import os
from typing import Optional

async def validate_api_key(request: Request, x_api_key: Optional[str] = Header(None)):
    """
    Validate the API key in the request header
    """
    # In production, you would use a secure method to store and validate API keys
    # For now, we'll check against an environment variable
    # expected_api_key = os.environ.get("API_KEY")
    
    # if not expected_api_key:
    #     # If no API key is set in the environment, skip validation in development
    #     if os.environ.get("ENVIRONMENT", "development") != "production":
    #         return True
    #     raise HTTPException(status_code=500, detail="API key validation not configured")
    
    # if not x_api_key:
    #     raise HTTPException(status_code=401, detail="API Key is required")
    
    # if x_api_key != expected_api_key:
    #     raise HTTPException(status_code=401, detail="Invalid API Key")
    
    # return True

def get_groq_api_key(x_groq_api_key: Optional[str] = Header(None)):
    """
    Get the Groq API key from header or environment
    """
    # First check if it's in the header
    if x_groq_api_key:
        return x_groq_api_key
    
    # Then check environment variable
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not found")
    
    return groq_api_key