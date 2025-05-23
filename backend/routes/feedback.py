from fastapi import APIRouter, HTTPException, Body, Depends
from pydantic import BaseModel, EmailStr
import logging
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import Feedback
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Model for feedback form data


class FeedbackForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/feedback", summary="Submit feedback form")
async def submit_feedback(form_data: FeedbackForm = Body(...), db: Session = Depends(get_db)):
    """
    Handle feedback form submissions and store them in the database
    """
    try:
        logger.info(
            f"Received feedback from {form_data.name} <{form_data.email}>")

        # Create new feedback record
        new_feedback = Feedback(
            name=form_data.name,
            email=form_data.email,
            subject=form_data.subject,
            message=form_data.message
        )

        # Save to database
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        logger.info(f"Feedback stored in database with ID: {new_feedback.id}")

        # Return success response
        return {"status": "success", "message": "Feedback submitted successfully"}

    except Exception as e:
        logger.error(f"Error processing feedback: {str(e)}")
        db.rollback()  # Roll back the transaction in case of error
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process feedback: {str(e)}"
        )


@router.get("/feedback", summary="Get all feedback submissions")
async def get_feedback(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all feedback submissions from the database
    """
    try:
        feedback = db.query(Feedback).order_by(
            Feedback.created_at.desc()).offset(skip).limit(limit).all()

        # Convert to dict for JSON response
        result = []
        for f in feedback:
            result.append({
                "id": f.id,
                "name": f.name,
                "email": f.email,
                "subject": f.subject,
                "message": f.message,
                "created_at": f.created_at.isoformat() if f.created_at else None
            })

        return {"status": "success", "feedback": result}

    except Exception as e:
        logger.error(f"Error retrieving feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve feedback: {str(e)}"
        )
