from fastapi import HTTPException
import os

def get_groq_api_key():
    """
    Get the Groq API key from header or environment
    """
    
    # Then check environment variable
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=500, detail="Groq API key not found")
    
    return groq_api_key