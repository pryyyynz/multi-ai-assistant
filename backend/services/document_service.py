import os
import tempfile
from typing import Dict, List, Optional
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
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentQAService:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.vector_store = None
        self.embeddings = self._get_embeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        
    def _get_embeddings(self) -> Embeddings:
        """Initialize the embedding model"""
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    def _get_llm(self):
        """Initialize the Groq LLM"""
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
            
            # Load and process the document
            loader = self._get_loader_for_file(temp_file_path)
            documents = loader.load()
            
            # Split the documents
            splits = self.text_splitter.split_documents(documents)
            
            logger.info(f"Processed {filename}: {len(splits)} chunks created")
            
            # Create or update the vector store
            if self.vector_store is None:
                self.vector_store = FAISS.from_documents(splits, self.embeddings)
            else:
                self.vector_store.add_documents(splits)
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            return True
            
        except Exception as e:
            logger.error(f"Error processing file {filename}: {str(e)}")
            return False
    
    async def query_documents(self, question: str, k: int = 4) -> Dict:
        """Query the vector store and return an answer"""
        if self.vector_store is None:
            return {"answer": "No documents have been processed yet. Please upload documents first."}
        
        try:
            # Create retrieval chain
            retriever = self.vector_store.as_retriever(search_kwargs={"k": k})
            
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
            answer = chain.invoke(question)
            
            return {"answer": answer}
            
        except Exception as e:
            logger.error(f"Error querying documents: {str(e)}")
            return {"answer": "An error occurred while processing your question."}