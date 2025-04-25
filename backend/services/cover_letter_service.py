import os
import tempfile
from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain.schema import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
import json
from typing import Optional, Tuple, Dict, BinaryIO

async def parse_cv_file(file: BinaryIO, filename: str) -> str:
    """
    Parse CV file (PDF or DOCX) and extract text content
    """
    # Create a temporary file to save the uploaded content
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
        temp_file.write(file.read())
        temp_path = temp_file.name
    
    try:
        # Process based on file extension
        file_extension = os.path.splitext(filename)[1].lower()
        
        if file_extension == '.pdf':
            # Use PyPDFLoader for PDF files
            loader = PyPDFLoader(temp_path)
            documents = loader.load()
            text_content = ' '.join([doc.page_content for doc in documents])
        elif file_extension in ['.docx', '.doc']:
            # Use Docx2txtLoader for Word documents
            loader = Docx2txtLoader(temp_path)
            documents = loader.load()
            text_content = ' '.join([doc.page_content for doc in documents])
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        return text_content
    finally:
        # Clean up the temporary file
        os.unlink(temp_path)

async def extract_cv_information(cv_text: str, groq_api_key: str) -> Dict:
    """
    Extract relevant information from the provided CV text
    """
    llm = ChatGroq(
        api_key=groq_api_key,
        model_name="llama3-70b-8192",
    )
    
    extraction_template = """
    Extract the following information from the provided CV/resume. Return the information in a JSON format:
    
    CV Content:
    {cv_text}
    
    Please extract and return ONLY a JSON object with these fields:
    - name: The full name of the person
    - current_role: Current or most recent job title
    - years_experience: Total years of professional experience (number)
    - key_skills: List of 5-8 most relevant professional skills
    - education: Highest level of education and field
    - achievements: 2-3 notable professional achievements
    
    Return ONLY valid JSON with no additional text or explanation.
    """
    
    extraction_prompt = ChatPromptTemplate.from_template(extraction_template)
    extraction_chain = extraction_prompt | llm | StrOutputParser()
    
    # Extract information from the CV
    result = await extraction_chain.ainvoke({"cv_text": cv_text})
    
    # Parse the JSON result
    try:
        extracted_info = json.loads(result)
        return extracted_info
    except json.JSONDecodeError:
        # Fallback in case the LLM doesn't return valid JSON
        return {
            "name": "Unknown",
            "current_role": "Unknown",
            "years_experience": 0,
            "key_skills": [],
            "education": "Unknown",
            "achievements": []
        }

async def generate_cover_letter_from_cv_file(
    cv_file: BinaryIO,
    filename: str,
    applying_role: str,
    company_name: str,
    tone: str = "professional",
    additional_instructions: Optional[str] = None,
    groq_api_key: str = None
) -> Tuple[str, Dict]:
    """
    Generate a personalized cover letter by processing a CV file and extracting information
    """
    # Parse the CV file to extract text
    cv_text = await parse_cv_file(cv_file, filename)
    
    # Extract information from the CV text
    extracted_info = await extract_cv_information(cv_text, groq_api_key)
    
    # Initialize Groq LLM
    llm = ChatGroq(
        api_key=groq_api_key,
        model_name="llama3-70b-8192",
    )
    
    # Create the prompt template
    template = """
    You are a professional cover letter writer. Generate a personalized cover letter using the following information:

    Applicant Information:
    - Name: {name}
    - Current Role: {current_role}
    - Years of Experience: {years_experience}
    - Key Skills: {key_skills}
    - Education: {education}
    - Notable Achievements: {achievements}
    
    Job Information:
    - Role Applying For: {applying_role}
    - Company Name: {company_name}
    
    Original CV Text (for additional context):
    {cv_text}
    
    Tone: {tone}
    
    Additional Instructions: {additional_instructions}
    
    Guidelines:
    - Create a compelling cover letter that highlights how the candidate's experience, skills, and achievements make them a good fit for the specified role
    - Focus on matching their skills and experience to the target role's requirements
    - Create a compelling narrative that showcases their value proposition
    - Keep the letter concise (300-400 words) and professional
    - Use the specified tone throughout the letter
    - Format the letter properly with date, greeting, body paragraphs, closing, and signature
    - Do not include any placeholders or instructions in the final output
    
    Return only the formatted cover letter, ready to use.
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    
    # Create the chain
    chain = prompt | llm | StrOutputParser()
    
    # Generate the cover letter
    cover_letter = await chain.ainvoke({
        "name": extracted_info.get("name", "Unknown"),
        "current_role": extracted_info.get("current_role", "Unknown"),
        "years_experience": extracted_info.get("years_experience", 0),
        "key_skills": ", ".join(extracted_info.get("key_skills", [])),
        "education": extracted_info.get("education", "Unknown"),
        "achievements": ", ".join(extracted_info.get("achievements", [])),
        "applying_role": applying_role,
        "company_name": company_name,
        "cv_text": cv_text,
        "tone": tone,
        "additional_instructions": additional_instructions if additional_instructions else "None"
    })
    
    return cover_letter, extracted_info, cv_text