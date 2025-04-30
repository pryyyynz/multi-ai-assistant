import os
import logging
from typing import List, Optional
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

class VectorStoreManager:
    def __init__(
        self, 
        collection_name: str = "documents",
        db_dir: str = "./data/chroma_db",
        embedding_model_name: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize the vector store manager with more robust path handling and error recovery.
        
        Args:
            collection_name: Name of the Chroma collection
            db_dir: Base directory for ChromaDB persistence
            embedding_model_name: Name of the HuggingFace embedding model to use
        """
        # Setup logging
        self.logger = logging.getLogger(__name__)
        
        # Set paths with better handling for different environments
        self.collection_name = collection_name
        
        # Get db_path, prioritizing environment variable if set
        self.db_dir = os.environ.get("CHROMA_DB_DIR", db_dir)
        self.db_path = os.path.join(self.db_dir, collection_name)
        
        # Ensure the directory exists
        os.makedirs(self.db_path, exist_ok=True)
        
        self.logger.info(f"Using vector store path: {self.db_path}")
        
        # Initialize embedding model with error handling
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name=embedding_model_name,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
            self.logger.info(f"Successfully loaded embedding model: {embedding_model_name}")
        except Exception as e:
            self.logger.error(f"Failed to load primary embedding model: {str(e)}")
            # Fall back to a smaller model
            try:
                self.logger.info("Falling back to smaller embedding model")
                self.embeddings = HuggingFaceEmbeddings(
                    model_name="distilbert-base-uncased",
                    model_kwargs={"device": "cpu"},
                    encode_kwargs={"normalize_embeddings": True}
                )
            except Exception as e2:
                self.logger.error(f"Failed to load fallback model: {str(e2)}")
                raise RuntimeError("Could not initialize any embedding model")
        
        self.vector_store = None

    def load_or_create(self, documents: Optional[List[Document]] = None, force_refresh: bool = False):
        """
        Create or load the vector store with robust error handling.
        
        Args:
            documents: List of documents to index if creating a new store
            force_refresh: Whether to force reindexing documents
            
        Returns:
            The initialized vector store
        """
        try:
            # Check if the vector store exists
            exists = os.path.exists(os.path.join(self.db_path, "chroma.sqlite3"))
            
            if exists and not force_refresh:
                self.logger.info(f"Loading existing vector store from {self.db_path}")
                try:
                    self.vector_store = Chroma(
                        persist_directory=self.db_path,
                        embedding_function=self.embeddings,
                        collection_name=self.collection_name
                    )
                    self.logger.info(f"Successfully loaded vector store with {self.vector_store._collection.count()} documents")
                except Exception as e:
                    self.logger.error(f"Error loading existing vector store: {str(e)}")
                    if documents:
                        self.logger.info("Recreating vector store due to loading error")
                        force_refresh = True
                    else:
                        raise RuntimeError("Could not load vector store and no documents provided to create new one")
            
            if not exists or force_refresh:
                if not documents:
                    self.logger.error("Cannot create vector store: no documents provided")
                    raise ValueError("Documents are required to create a new vector store")
                
                self.logger.info(f"Creating new vector store at {self.db_path} with {len(documents)} documents")
                
                # Create directory if it doesn't exist
                os.makedirs(self.db_path, exist_ok=True)
                
                # Create new vector store from documents
                self.vector_store = Chroma.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    persist_directory=self.db_path,
                    collection_name=self.collection_name
                )
                
                self.logger.info(f"Successfully created vector store with {len(documents)} documents")
            
            return self.vector_store
            
        except Exception as e:
            self.logger.error(f"Error in load_or_create: {str(e)}")
            # Create in-memory vector store as last resort if documents are available
            if documents:
                self.logger.info("Creating fallback in-memory vector store")
                self.vector_store = Chroma.from_documents(
                    documents=documents,
                    embedding=self.embeddings,
                    collection_name=self.collection_name
                )
                return self.vector_store
            else:
                raise RuntimeError(f"Could not initialize vector store: {str(e)}")