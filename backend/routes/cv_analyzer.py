from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, Query
from typing import List, Optional
from services.cv_service import CVService
from services.job_matching_service import JobMatchingService
from models.schemas import CVAnalysisResponse, JobMatchResponse

router = APIRouter()
cv_service = CVService()
job_service = JobMatchingService()

@router.post("/analyze-cv", response_model=CVAnalysisResponse)
async def analyze_cv(
    file: UploadFile = File(...),
    top_n: int = Query(5, description="Number of top job matches to return")
):
    """
    Upload a CV file for analysis and job matching.
    Returns CV analysis results and job matches with similarity scores.
    """
    try:
        # Process the CV file
        cv_text, cv_data = await cv_service.extract_cv_info(file)
        
        # Get recommendations and remarks
        recommendations = await cv_service.generate_recommendations(cv_text)
        
        # Find matching jobs
        matching_jobs = await job_service.find_matching_jobs(cv_text, top_n=top_n)
        
        return {
            "cv_data": cv_data,
            "recommendations": recommendations,
            "matching_jobs": matching_jobs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CV: {str(e)}")

# @router.get("/jobs", response_model=List[JobMatchResponse])
# async def get_jobs(
#     query: str,
#     top_n: int = Query(5, description="Number of top job matches to return")
# ):
#     """
#     Search for jobs using a text query.
#     Returns matched jobs with similarity scores.
#     """
#     try:
#         matching_jobs = await job_service.find_matching_jobs(query, top_n=top_n)
#         return matching_jobs
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@router.get("/refresh-embeddings")
async def refresh_embeddings():
    """
    Refresh the job embeddings database.
    """
    try:
        await job_service.initialize_embeddings(force_refresh=True)
        return {"message": "Job embeddings refreshed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing embeddings: {str(e)}")