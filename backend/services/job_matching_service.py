import os
import pandas as pd
import numpy as np
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain.embeddings import OpenAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores.utils import filter_complex_metadata
from langchain_community.vectorstores import Chroma
from langchain.schema.document import Document
from dotenv import load_dotenv
import tempfile
from typing import Optional
from pydantic import BaseModel, HttpUrl, Field
from pathlib import Path

load_dotenv()

class JobMatchResponse(BaseModel):
    title: str
    url: str
    date_posted: str
    similarity_score: float
    description: Optional[str] = None
    
    
class JobMatchingService:
    def __init__(self):
        """Initialize the Job Matching Service."""
        # Initialize embeddings model
        self.embeddings = self._initialize_embeddings_model()
        
        # Path to the dataset
        self.dataset_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'ghanajob_listings.csv')
        
        # Vector DB path
        self.db_path = os.path.join(tempfile.gettempdir(), "job_listings_db")
        
        # Vector store
        self.vector_store = None
        
        # Job listings dataframe
        self.job_listings = None
    
    def _initialize_embeddings_model(self):
        """Initialize embeddings model based on available API keys."""
        try:
            # Try to use Groq embeddings if API key is available
            if os.getenv("GROQ_API_KEY"):
                return HuggingFaceEmbeddings(
                    model_name="all-MiniLM-L6-v2"
                )
        except Exception as e:
            print(f"Error initializing Groq embeddings: {e}")
        
        # Fallback to HuggingFace embeddings
        return HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
    
    async def initialize_embeddings(self, force_refresh=False):
        """
        Load the job listings dataset and initialize embeddings.
        Can force refresh the vector database if needed.
        """
        # Check if embeddings already exist and we don't need to refresh
        if self.vector_store is not None and not force_refresh:
            return
        
        # Load the dataset
        self.job_listings = pd.read_csv(self.dataset_path)
        
        # Clean and prepare data
        self.job_listings = self.job_listings.fillna("N/A")
        
        # Create documents for vector store
        documents = []
        for _, row in self.job_listings.iterrows():
            # Combine relevant fields for better matching
            content = f"Job Title: {row['title']}\n"
            
            if row['description'] != "N/A":
                content += f"Description: {row['description']}\n"
            
            if row['company'] != "N/A":
                content += f"Company: {row['company']}\n"
            
            if row['location'] != "N/A":
                content += f"Location: {row['location']}\n"
            
            if row['skills'] != "N/A":
                content += f"Skills: {row['skills']}\n"
                
            # Create document with metadata
            document = Document(
                page_content=content,
                metadata={
                    "title": row['title'],
                    "url": row['url'],
                    "date_posted": row['date_posted'],
                    "description": row['description'] if row['description'] != "N/A" else ""  # Convert None/N/A to empty string
                }
            )
            documents.append(document)
        
        # Create or load the vector store
        if os.path.exists(self.db_path) and not force_refresh:
            self.vector_store = Chroma(
                persist_directory=self.db_path,
                embedding_function=self.embeddings
            )
        else:
            # Create new vector store from documents
            self.vector_store = Chroma.from_documents(
                documents=[doc for doc in documents],
                embedding=self.embeddings,
                persist_directory=self.db_path
            )
            
            # Persist the vector store
            self.vector_store.persist()
    
    async def find_matching_jobs(self, query_text: str, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Find jobs that match the query text based on semantic similarity.
        Returns a list of matching jobs with similarity scores.
        """
        # Make sure embeddings are initialized
        if self.vector_store is None:
            await self.initialize_embeddings()
        
        # Search for similar documents
        results = self.vector_store.similarity_search_with_score(query_text, k=top_n)
        
        # Format results
        matching_jobs = []
        for doc, score in results:
            # Convert score to similarity (higher is better)
            similarity_score = float(1.0 - score)
            
            # Handle description field - could be empty string from metadata
            description = doc.metadata.get("description")
            if description == "":
                description = None
            
            job_match = JobMatchResponse(
                title=doc.metadata["title"],
                url=doc.metadata["url"],
                date_posted=doc.metadata["date_posted"],
                similarity_score=round(similarity_score, 3),
                description=description
            )
            matching_jobs.append(job_match)
        
        # Sort by similarity score (highest first)
        matching_jobs.sort(key=lambda x: x.similarity_score, reverse=True)
        
        return matching_jobs