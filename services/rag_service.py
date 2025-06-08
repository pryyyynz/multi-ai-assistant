import os
import faiss
import requests
import logging
from typing import List, Dict, Any
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain_community.tools import DuckDuckGoSearchRun
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        """
        Initialize the RAG service with HuggingFace embeddings and Groq LLM
        """
        # Use a sentence-transformer model that's good for semantic search
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
        logger.info("Using HuggingFace embeddings")
        
        # Setup DuckDuckGo search which doesn't require API keys
        self.search = DuckDuckGoSearchRun()
        self.search_enabled = True
        logger.info("DuckDuckGo Search enabled")
        
        # Initialize the vector store
        self.vector_store = None
        
        # Path for storing the index
        self.index_path = "faiss_index"
        
        # Use Groq for LLM
        api = os.getenv("GROQ_API_KEY")
        if api:
            self.llm = ChatGroq(
                api_key=api,
                model_name="compound-beta", 
                temperature=0.4,
            )
            logger.info("Using Groq for generation")
        else:
            logger.warning("Groq API key not found, response generation will be limited")
            self.llm = None
        
        # Load index if it exists
        self._load_or_create_index()
    
    def _load_or_create_index(self):
        """Load existing index or create a new one"""
        if os.path.exists(self.index_path) and os.path.isdir(self.index_path):
            try:
                self.vector_store = FAISS.load_local(
                    self.index_path, self.embeddings
                )
                logger.info(f"Loaded existing index from {self.index_path}")
            except Exception as e:
                logger.error(f"Error loading index: {str(e)}")
                self.vector_store = None
        
        if self.vector_store is None:
            # Create an empty vector store if loading failed
            self.vector_store = FAISS.from_documents(
                [Document(page_content="Ghana placeholder document", metadata={"source": "init"})],
                self.embeddings
            )
            logger.info("Created new empty vector store")
            self._save_index()
    
    def _save_index(self):
        """Save the FAISS index to disk"""
        if self.vector_store:
            self.vector_store.save_local(self.index_path)
            logger.info(f"Saved index to {self.index_path}")
    
    def load_documents(self, file_paths: List[str]):
        """
        Load documents from the provided file paths
        
        Args:
            file_paths: List of paths to documents to load
        """
        documents = []
        
        for file_path in file_paths:
            try:
                if file_path.endswith('.pdf'):
                    loader = PyPDFLoader(file_path)
                else:
                    loader = TextLoader(file_path)
                
                docs = loader.load()
                documents.extend(docs)
                logger.info(f"Loaded document: {file_path}")
            except Exception as e:
                logger.error(f"Error loading document {file_path}: {str(e)}")
        
        return documents
    
    def process_documents(self, documents: List[Document]):
        """
        Process documents by splitting them and adding to the vector store
        
        Args:
            documents: List of documents to process
        """
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunked_documents = text_splitter.split_documents(documents)
        
        # Add documents to the vector store
        self.vector_store.add_documents(chunked_documents)
        logger.info(f"Added {len(chunked_documents)} chunks to the vector store")
        
        # Save the updated index
        self._save_index()
    
    def search_web(self, query: str, num_results: int = 3) -> List[str]:
        """
        Search the web using DuckDuckGo for relevant information
        
        Args:
            query: The search query
            num_results: Number of results to return
            
        Returns:
            List of search result snippets
        """
        if not self.search_enabled:
            logger.warning("Web search is not enabled")
            return []
        
        try:
            search_query = f"Ghana {query}"
            # DuckDuckGo returns a single string with results
            results_text = self.search.run(search_query)
            
            # Basic parsing of the results
            # This is simple; in production you might want a more robust parser
            results = results_text.split("\n\n")[:num_results]
            
            # Format snippets
            snippets = []
            for i, result in enumerate(results):
                snippets.append(f"Search Result {i+1}: {result}")
            
            return snippets
        except Exception as e:
            logger.error(f"Error during web search: {str(e)}")
            return []
    
    def retrieve_relevant_info(self, query: str, top_k: int = 5) -> List[Document]:
        """
        Retrieve relevant documents for a query
        
        Args:
            query: User query
            top_k: Number of documents to retrieve
            
        Returns:
            List of relevant documents
        """
        if not self.vector_store:
            return []
        
        # Search for relevant documents
        docs = self.vector_store.similarity_search(query, k=top_k)
        return docs
    
    def generate_response(self, query: str) -> Dict[str, Any]:
        """
        Generate a response for the given query
        
        Args:
            query: User query
            
        Returns:
            Dictionary containing the response and source information
        """
        # Get relevant documents from the vector store
        relevant_docs = self.retrieve_relevant_info(query)
        
        # Get web search results
        search_results = self.search_web(query)
        
        # Combine retrieved documents and search results
        combined_context = ""
        sources = []
        
        # Add document content
        for i, doc in enumerate(relevant_docs):
            combined_context += f"[Document {i+1}]: {doc.page_content}\n\n"
            if doc.metadata.get("source") and doc.metadata.get("source") != "init":
                sources.append(doc.metadata.get("source"))
        
        # Add search results
        for i, result in enumerate(search_results):
            combined_context += f"{result}\n\n"
        
        # Create prompt
        prompt_template = """You are GhanaGPT, a helpful assistant specializing in Ghanaian culture, 
        language, proverbs, current events, and general knowledge about Ghana.
        
        Use the following context to answer the question. If the answer is not 
        in the context, use your knowledge but make it clear what information comes from 
        where. Always be respectful and provide culturally accurate information.
        
        If asked about slang, ensure you explain the meaning accurately and provide example usage.
        If asked about proverbs, explain their meaning and cultural context.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer:"""
        
        # If we have the LLM, use it to generate a response
        if self.llm:
            prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(),
                chain_type_kwargs={"prompt": prompt}
            )
            
            try:
                # Get answer
                result = qa_chain.invoke({"query": query})
                answer = result.get("result", "")
            except Exception as e:
                logger.error(f"Error during response generation: {str(e)}")
                answer = f"Sorry, I encountered an error while generating a response: {str(e)}"
        else:
            # Fallback if no LLM is available
            answer = "I'm sorry, but I'm currently unable to generate a response. The Groq API key is missing."
        
        return {
            "answer": answer,
            "sources": list(set(sources)),  # Remove duplicates
            "search_results": len(search_results) > 0
        }

    def add_document_from_text(self, text: str, source: str = "manual_input"):
        """
        Add a document from raw text
        
        Args:
            text: The text content to add
            source: Source identifier for the text
        """
        doc = Document(page_content=text, metadata={"source": source})
        docs = [doc]
        
        # Split and add to vector store
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunked_documents = text_splitter.split_documents(docs)
        
        # Add to vector store
        self.vector_store.add_documents(chunked_documents)
        logger.info(f"Added document from text with source '{source}'")
        
        # Save the updated index
        self._save_index()
        
        return len(chunked_documents)