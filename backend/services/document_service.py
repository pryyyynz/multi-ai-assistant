# Improved document_service.py with better debugging and session handling
import os
import tempfile
from typing import Dict, List, Optional
import logging
import uuid
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import APIKeyHeader
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredPowerPointLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.embeddings import Embeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.embeddings import HuggingFaceEmbeddings

class ServiceRegistry:
    """Registry for sharing services across the application"""
    
    def __init__(self):
        self.services = {}
        
    def register_service(self, name, service):
        """Register a service by name"""
        self.services[name] = service
        logger.info(f"Registered service: {name}")
        
    def get_service(self, name):
        """Get a service by name"""
        service = self.services.get(name)
        if not service:
            logger.warning(f"Service not found: {name}")
        return service

# Create a global service registry
service_registry = ServiceRegistry()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Header for session token
SESSION_TOKEN_HEADER = APIKeyHeader(name="X-Session-Token", auto_error=False)

class SessionManager:
    """Manages user sessions and their document stores"""
    
    def __init__(self, session_expiry_hours=24):
        self.sessions = {}  # Dict mapping session_id to SessionData
        self.session_expiry_hours = session_expiry_hours
        logger.info("Session manager initialized")
    
    def create_session(self) -> str:
        """Create a new session and return the session token"""
        session_id = str(uuid.uuid4())
        document_service = DocumentQAService(session_id)
        
        self.sessions[session_id] = {
            "created_at": datetime.now(),
            "last_accessed": datetime.now(),
            "document_service": document_service
        }
        
        # Register this document service in the global registry
        service_registry.register_service(f"document_service_{session_id}", document_service)
        
        logger.info(f"New session created: {session_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get a session by ID if it exists and is not expired"""
        if session_id not in self.sessions:
            logger.warning(f"Session not found: {session_id}")
            return None
            
        session = self.sessions[session_id]
        
        # Check if session is expired
        if (datetime.now() - session["last_accessed"]) > timedelta(hours=self.session_expiry_hours):
            logger.info(f"Session expired: {session_id}")
            self.delete_session(session_id)
            return None
            
        # Update last accessed time
        session["last_accessed"] = datetime.now()
        logger.debug(f"Session accessed: {session_id}")
        return session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session by ID"""
        if session_id in self.sessions:
            # Clean up any resources
            service = self.sessions[session_id]["document_service"]
            service.cleanup()
            
            # Remove the session
            del self.sessions[session_id]
            logger.info(f"Session deleted: {session_id}")
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions to free memory"""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if (current_time - session["last_accessed"]) > timedelta(hours=self.session_expiry_hours):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self.delete_session(session_id)
            
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")

    def debug_sessions(self):
        """Return debug information about all sessions"""
        return {
            "session_count": len(self.sessions),
            "sessions": [
                {
                    "id": sid,
                    "created_at": session["created_at"].isoformat(),
                    "last_accessed": session["last_accessed"].isoformat(),
                    "document_count": session["document_service"].get_document_count(),
                    "has_vector_store": session["document_service"].vector_store is not None
                }
                for sid, session in self.sessions.items()
            ]
        }


class DocumentQAService:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.vector_store = None
        self.embeddings = self._get_embeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        self.temp_files = []  # Track temporary files for cleanup
        self.document_count = 0  # Keep explicit count of documents
        logger.info(f"Document QA Service initialized for session: {session_id}")
        
    def _get_embeddings(self) -> Embeddings:
        """Initialize the embedding model"""
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    def _get_llm(self):
        """Initialize the Groq LLM"""
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY not set, this will cause errors when querying documents")
            
        return ChatGroq(
            api_key=self.groq_api_key,
            model_name="llama3-70b-8192",
            temperature=0.2
        )
    
    def _get_loader_for_file(self, file_path: str):
        """Get the appropriate loader based on file extension"""
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.pdf':
            return PyPDFLoader(file_path)
        elif file_extension in ['.docx', '.doc']:
            return Docx2txtLoader(file_path)
        elif file_extension in ['.ppt', '.pptx']:
            return UnstructuredPowerPointLoader(file_path)
        else:
            raise ValueError(f"Unsupported file extension: {file_extension}")
    
    async def process_file(self, file_content: bytes, filename: str) -> bool:
        """Process a file and add it to the vector store"""
        try:
            # Save the file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
                self.temp_files.append(temp_file_path)  # Track for cleanup
            
            logger.info(f"Processing file {filename} in session {self.session_id}")
            
            # Load and process the document
            loader = self._get_loader_for_file(temp_file_path)
            documents = loader.load()
            
            if not documents:
                logger.warning(f"No documents loaded from file {filename}")
                return False
                
            logger.info(f"Loaded {len(documents)} document pages from {filename}")
            
            # Add session metadata to each document
            for doc in documents:
                if not hasattr(doc, 'metadata'):
                    doc.metadata = {}
                doc.metadata['session_id'] = self.session_id
                doc.metadata['filename'] = filename
            
            # Split the documents
            splits = self.text_splitter.split_documents(documents)
            
            if not splits:
                logger.warning(f"No splits created from file {filename}")
                return False
                
            logger.info(f"Created {len(splits)} chunks from {filename}")
            
            # Create or update the vector store
            if self.vector_store is None:
                logger.info(f"Creating new vector store for session {self.session_id}")
                self.vector_store = FAISS.from_documents(splits, self.embeddings)
            else:
                logger.info(f"Adding documents to existing vector store for session {self.session_id}")
                self.vector_store.add_documents(splits)
            
            # Increment document count
            self.document_count += 1
            
            # Verify vector store creation
            if self.vector_store is None:
                logger.error(f"Failed to create vector store for session {self.session_id}")
                return False
                
            logger.info(f"Successfully processed file {filename} for session {self.session_id}. Document count: {self.document_count}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing file {filename} for session {self.session_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return False
    
    async def query_documents(self, question: str, k: int = 4) -> Dict:
        """Query the vector store and return an answer"""
        if self.vector_store is None:
            logger.warning(f"No vector store available for session {self.session_id}")
            return {"answer": "No documents have been processed yet. Please upload documents first.",
                    "has_documents": False}
        
        try:
            # Create retrieval chain
            retriever = self.vector_store.as_retriever(search_kwargs={"k": k})
            
            # Log retrieval attempt
            logger.info(f"Creating retriever for session {self.session_id} with k={k}")
            
            # Create prompt template
            template = """You are a helpful assistant that answers questions based on provided documents.
            Answer the question based only on the following context:
            {context}
            
            Question: {question}
            
            If the answer is not in the context, say "I don't have enough information to answer this question."
            """
            
            prompt = ChatPromptTemplate.from_template(template)
            
            # Create the chain
            llm = self._get_llm()
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | prompt
                | llm
                | StrOutputParser()
            )
            
            # Execute the chain
            logger.info(f"Executing query chain for session {self.session_id}")
            answer = chain.invoke(question)
            
            logger.info(f"Query successful for session {self.session_id}")
            
            return {"answer": answer, "has_documents": True}
            
        except Exception as e:
            logger.error(f"Error querying documents for session {self.session_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {"answer": "An error occurred while processing your question.",
                    "has_documents": True,
                    "error": str(e)}
    
    def get_document_count(self) -> int:
        """Get the number of documents in the store"""
        return self.document_count
    
    def cleanup(self):
        """Clean up resources when session is deleted"""
        # Delete any temporary files
        for temp_file in self.temp_files:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception as e:
                logger.error(f"Error deleting temp file {temp_file}: {str(e)}")
        
        # Clear references to free memory
        self.vector_store = None
        self.temp_files = []
        self.document_count = 0
        logger.info(f"Cleaned up resources for session {self.session_id}")


# Global session manager
session_manager = SessionManager()

# Dependency for getting the current session
async def get_session_service(
    request: Request,
    session_token: str = Depends(SESSION_TOKEN_HEADER)
):
    """Get the document service for the current session"""
    logger.info(f"Requested session with token from header: {session_token}")
    
    # If no session token in header, try to get from cookie
    if not session_token:
        session_token = request.cookies.get("session_token")
        logger.info(f"Retrieved session token from cookie: {session_token}")
    
    if not session_token:
        # No session token found, create a new session
        session_token = session_manager.create_session()
        logger.info(f"Created new session with token: {session_token}")
        
    session = session_manager.get_session(session_token)
    if not session:
        # Session expired or invalid, create a new one
        logger.info(f"Session not found or expired: {session_token}, creating new session")
        session_token = session_manager.create_session()
        session = session_manager.get_session(session_token)
    
    # Store the session token for middleware to add to response headers
    session["token"] = session_token
    
    # Log status of document service
    doc_service = session["document_service"]
    logger.info(f"Session {session_token} has {doc_service.get_document_count()} documents and vector store: {doc_service.vector_store is not None}")
    
    return doc_service, session_token