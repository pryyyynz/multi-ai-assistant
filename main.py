import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app instance
app = FastAPI(title="Multi AI API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a root endpoint for the application
@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint providing basic information about the API"""
    logger.info("Root endpoint called")
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Multi AI API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 40px auto;
                max-width: 800px;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            h1 {
                color: #0066cc;
            }
        </style>
    </head>
    <body>
        <h1>Multi AI API</h1>
        <p>Welcome to the Multi AI API. The service is running successfully.</p>
        <p>For API documentation, visit <a href="/docs">/docs</a></p>
    </body>
    </html>
    """
    return html_content

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring services"""
    logger.info("Health check endpoint called")
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Simple test endpoint
@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify routing is working"""
    logger.info("Test endpoint called")
    return {"message": "API is working correctly"}

if __name__ == "__main__":
    # When run directly, use port 8080 (DigitalOcean's default)
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    logger.info(f"Starting application on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port)
