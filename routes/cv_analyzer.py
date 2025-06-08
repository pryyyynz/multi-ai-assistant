from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List, Optional
from services.cv_service import CVService
from services.job_matching_service import JobMatchingService
from models.schemas import CVAnalysisResponse, JobMatchResponse

# Import the scraper setup function
from services.job_scrap import setup_scraper_in_main_app

router = APIRouter()
cv_service = CVService() 
job_service = JobMatchingService()

# Initialize the scraper
scraper = setup_scraper_in_main_app()

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

@router.get("/refresh-embeddings")
async def refresh_embeddings():
    """
    Refresh the job embeddings database by running the Ghana Job scraper
    and then refreshing the embeddings.
    """
    try:
        # Run the Ghana Job scraper to get fresh job data
        scraper["run_now"]()
        
        # After scraping is complete, refresh the embeddings
        await job_service.initialize_embeddings(force_refresh=True)
        
        return {
            "message": "Job scraper executed and embeddings refreshed successfully",
            "scraper_status": scraper["get_status"]()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing job data and embeddings: {str(e)}")

@router.get("/scraper-status")
async def get_scraper_status():
    """
    Get the current status of the job scraper.
    """
    try:
        status = scraper["get_status"]()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting scraper status: {str(e)}")

@router.post("/run-scraper")
async def run_scraper():
    """
    Manually trigger the job scraper to run.
    """
    try:
        scraper["run_now"]()
        return {"message": "Job scraper started successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting job scraper: {str(e)}")