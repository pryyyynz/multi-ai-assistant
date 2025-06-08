from pydantic import BaseModel, HttpUrl, Field
from typing import List, Dict, Optional, Any, Union
from datetime import date

class CVData(BaseModel):
    name: Optional[str] = None
    email: Optional[Union[str, List[str]]] = None
    phone: Optional[Union[str, List[str]]] = None  # Updated to accept either a string or a list of strings
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    summary: Optional[str] = None

class JobMatchResponse(BaseModel):
    title: str
    url: str
    date_posted: str
    similarity_score: float
    description: Optional[str] = None

class CVAnalysisResponse(BaseModel):
    cv_data: CVData
    recommendations: Dict[str, Any]
    matching_jobs: List[JobMatchResponse]