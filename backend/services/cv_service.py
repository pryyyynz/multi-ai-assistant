import os
import re
from typing import Dict, List, Tuple, Any
from fastapi import UploadFile
import tempfile
import docx2txt
from pypdf import PdfReader
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage
from dotenv import load_dotenv

load_dotenv()

class CVService:
    def __init__(self):
        """Initialize the CV Service with LLM capabilities."""
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROQ_API_KEY is not set in environment variables")
        
        self.llm = ChatGroq(
            api_key=api_key,
            model_name="llama3-70b-8192"
        )
    
    async def extract_cv_info(self, file: UploadFile) -> Tuple[str, Dict[str, Any]]:
        """
        Extract text and information from the CV file.
        Returns the raw text and structured data from the CV.
        """
        # Extract text from the file
        cv_text = await self._extract_text(file)
        
        # Use LLM to extract structured data from the CV
        cv_data = await self._extract_structured_data(cv_text)
        
        return cv_text, cv_data
    
    async def _extract_text(self, file: UploadFile) -> str:
        """Extract text from CV file (PDF or DOCX)."""
        file_content = await file.read()
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        
        try:
            temp_file.write(file_content)
            temp_file.close()
            
            # Process based on file extension
            file_ext = file.filename.split('.')[-1].lower()
            
            if file_ext == 'pdf':
                text = self._extract_from_pdf(temp_file.name)
            elif file_ext in ['docx', 'doc']:
                text = self._extract_from_docx(temp_file.name)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
                
            return text
        finally:
            os.unlink(temp_file.name)
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file."""
        return docx2txt.process(file_path)
    
    async def _extract_structured_data(self, cv_text: str) -> Dict[str, Any]:
        """
        Use LLM to extract structured data from CV text.
        Returns dictionary with name, email, phone, skills, education, experience, etc.
        """
        prompt = f"""
        Extract the following information from the CV text below and return it in a structured JSON format:
        - name: The candidate's full name
        - email: The candidate's email address
        - phone: The candidate's phone number
        - skills: A list of the candidate's skills
        - education: A list of dictionaries containing the candidate's education history with institution, degree, field, and dates
        - experience: A list of dictionaries containing the candidate's work experience with company, position, dates, and responsibilities
        - summary: A brief summary or profile section if available

        CV Text:
        {cv_text}

        Return only the JSON object with the extracted information. If any field cannot be found, set it to null or an empty list as appropriate.
        """

        messages = [HumanMessage(content=prompt)]
        response = self.llm.invoke(messages)
        
        # Extract JSON from response
        response_text = response.content
        
        # Find JSON in the response (between curly braces)
        json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
        if json_match:
            import json
            try:
                extracted_data = json.loads(json_match.group(0))
                return extracted_data
            except json.JSONDecodeError as e:
                # Fallback if JSON parsing fails
                return {
                    "name": None,
                    "email": None,
                    "phone": None,
                    "skills": [],
                    "education": [],
                    "experience": [],
                    "summary": None
                }
        
        # Fallback if no JSON found
        return {
            "name": None,
            "email": None,
            "phone": None,
            "skills": [],
            "education": [],
            "experience": [],
            "summary": None
        }
    
    async def generate_recommendations(self, cv_text: str) -> Dict[str, Any]:
        """
        Generate recommendations and remarks based on the CV content.
        """
        prompt = f"""
        Analyze the following CV and provide:
        1. Strengths: List the strongest aspects of this CV
        2. Weaknesses: Identify areas that need improvement
        3. Recommendations: Provide specific suggestions for improving the CV
        4. Keywords: Suggest industry-relevant keywords that should be included
        5. Overall Rating: Rate the CV on a scale of 1-10
        
        CV Text:
        {cv_text}
        
        Format your response as a JSON object with the fields: strengths, weaknesses, recommendations, keywords, and rating.
        """
        
        messages = [HumanMessage(content=prompt)]
        response = self.llm.invoke(messages)
        
        # Extract JSON from response
        response_text = response.content
        
        # Find JSON in the response (between curly braces)
        json_match = re.search(r'(\{.*\})', response_text, re.DOTALL)
        if json_match:
            import json
            try:
                recommendations = json.loads(json_match.group(0))
                return recommendations
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "strengths": ["Could not parse recommendation data"],
                    "weaknesses": ["Could not parse recommendation data"],
                    "recommendations": ["Could not parse recommendation data"],
                    "keywords": [],
                    "rating": 0
                }
        
        # Fallback if no JSON found
        return {
            "strengths": ["Could not generate recommendations"],
            "weaknesses": ["Could not generate recommendations"],
            "recommendations": ["Could not generate recommendations"],
            "keywords": [],
            "rating": 0
        }