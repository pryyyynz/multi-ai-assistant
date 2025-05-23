# MCP-based document_service.py implementation
import os
import tempfile
from typing import Dict, List, Optional, Any, Union
import logging
import uuid
from fastapi import UploadFile, HTTPException, status
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
from langchain_core.documents import Document
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MCP Protocol Classes and Interfaces


class DocumentContext(BaseModel):
    """Document context for MCP architecture"""
    context_id: str
    document_count: int = 0
    has_vector_store: bool = False
    sources: List[str] = []

    class Config:
        arbitrary_types_allowed = True


class DocumentRequest(BaseModel):
    """Base request model for document operations"""
    context_id: Optional[str] = None


class QueryRequest(DocumentRequest):
    """Request model for querying documents"""
    question: str
    k: int = 4  # Number of chunks to retrieve


class QueryResponse(BaseModel):
    """Response model for document queries"""
    answer: str
    sources: List[str] = []
    context_id: str
    has_documents: bool = False
    document_count: int = 0
    error: Optional[str] = None


class UploadResponse(BaseModel):
    """Response model for document uploads"""
    success: bool
    message: str
    context_id: str
    document_count: int = 0
    filename: Optional[str] = None


class MCPDocumentService:
    """
    Model Context Protocol implementation for Document Q&A.
    Separates context management from model execution for improved modularity.
    """

    def __init__(self):
        self.contexts = {}  # Dictionary of context_id -> internal context state
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.embeddings = self._get_embeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200)
        logger.info("MCP Document Service initialized")

    def _get_embeddings(self) -> Embeddings:
        """Initialize the embedding model"""
        return HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def _get_llm(self):
        """Initialize the Groq LLM"""
        if not self.groq_api_key:
            logger.warning(
                "GROQ_API_KEY not set, this will cause errors when querying documents")

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

    def create_context(self) -> DocumentContext:
        """Create a new context and return its identifier"""
        context_id = str(uuid.uuid4())

        # Initialize internal context state
        self.contexts[context_id] = {
            "vector_store": None,
            "document_count": 0,
            "temp_files": [],
            "sources": []
        }

        logger.info(f"Created new document context: {context_id}")
        return DocumentContext(
            context_id=context_id,
            document_count=0,
            has_vector_store=False
        )

    def get_context(self, context_id: str) -> Optional[Dict[str, Any]]:
        """Get the internal context state by ID"""
        if context_id not in self.contexts:
            logger.warning(f"Context not found: {context_id}")
            return None
        return self.contexts[context_id]

    async def process_file(self, file_content: bytes, filename: str, context_id: Optional[str] = None) -> UploadResponse:
        """
        Process a file and add it to the vector store in the specified context
        If no context_id is provided, a new context will be created
        """
        # Get or create context
        if not context_id or context_id not in self.contexts:
            context = self.create_context()
            context_id = context.context_id
        else:
            context_state = self.contexts[context_id]

        try:
            # Save the file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name
                self.contexts[context_id]["temp_files"].append(temp_file_path)

            logger.info(f"Processing file {filename} in context {context_id}")

            # Load and process the document
            loader = self._get_loader_for_file(temp_file_path)
            documents = loader.load()

            if not documents:
                logger.warning(f"No documents loaded from file {filename}")
                return UploadResponse(
                    success=False,
                    message=f"No content could be extracted from {filename}",
                    context_id=context_id,
                    document_count=self.contexts[context_id]["document_count"],
                    filename=filename
                )

            logger.info(
                f"Loaded {len(documents)} document pages from {filename}")

            # Add context metadata to each document
            for doc in documents:
                if not hasattr(doc, 'metadata'):
                    doc.metadata = {}
                doc.metadata['context_id'] = context_id
                doc.metadata['filename'] = filename

            # Split the documents
            splits = self.text_splitter.split_documents(documents)

            if not splits:
                logger.warning(f"No splits created from file {filename}")
                return UploadResponse(
                    success=False,
                    message=f"Document splitting failed for {filename}",
                    context_id=context_id,
                    document_count=self.contexts[context_id]["document_count"],
                    filename=filename
                )

            logger.info(f"Created {len(splits)} chunks from {filename}")

            # Create or update the vector store
            if self.contexts[context_id]["vector_store"] is None:
                logger.info(
                    f"Creating new vector store for context {context_id}")
                self.contexts[context_id]["vector_store"] = FAISS.from_documents(
                    splits, self.embeddings)
            else:
                logger.info(
                    f"Adding documents to existing vector store for context {context_id}")
                self.contexts[context_id]["vector_store"].add_documents(splits)

            # Verify vector store was created properly
            if self.contexts[context_id]["vector_store"] is None:
                logger.error(
                    f"Failed to create vector store for context {context_id}")
                return UploadResponse(
                    success=False,
                    message=f"Failed to create vector store for {filename}",
                    context_id=context_id,
                    document_count=self.contexts[context_id]["document_count"],
                    filename=filename
                )

            # Add to sources and increment document count
            self.contexts[context_id]["sources"].append(filename)
            self.contexts[context_id]["document_count"] += 1

            logger.info(
                f"Successfully processed file {filename} for context {context_id}. Document count: {self.contexts[context_id]['document_count']}")

            # Verification step - explicitly log vector store state
            has_vector_store = self.contexts[context_id]["vector_store"] is not None
            document_count = self.contexts[context_id]["document_count"]
            logger.info(
                f"Context {context_id} state: has_vector_store={has_vector_store}, document_count={document_count}")

            return UploadResponse(
                success=True,
                message=f"Successfully processed {filename}",
                context_id=context_id,
                document_count=self.contexts[context_id]["document_count"],
                filename=filename
            )

        except Exception as e:
            logger.error(
                f"Error processing file {filename} for context {context_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())

            return UploadResponse(
                success=False,
                message=f"Error processing {filename}: {str(e)}",
                context_id=context_id,
                document_count=self.contexts[context_id]["document_count"] if context_id in self.contexts else 0,
                filename=filename
            )

    async def query(self, request: QueryRequest) -> QueryResponse:
        """
        Query documents in the specified context.
        If no context is specified or not found, a new context will be created.
        """
        # Get or create context
        context_id = request.context_id
        if not context_id or context_id not in self.contexts:
            context = self.create_context()
            context_id = context.context_id

            return QueryResponse(
                answer="No documents have been processed yet. Please upload documents first.",
                context_id=context_id,
                has_documents=False,
                document_count=0
            )

        context_state = self.contexts[context_id]
        vector_store = context_state["vector_store"]

        # Check if vector store exists and has documents
        if vector_store is None or context_state["document_count"] == 0:
            logger.warning(
                f"No vector store or documents available for context {context_id}")
            return QueryResponse(
                answer="No documents have been processed yet. Please upload documents first.",
                context_id=context_id,
                has_documents=False,
                document_count=context_state["document_count"]
            )

        try:
            # Create retrieval chain
            retriever = vector_store.as_retriever(
                search_kwargs={"k": request.k})

            # Log retrieval attempt
            logger.info(
                f"Creating retriever for context {context_id} with k={request.k}")

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
            logger.info(f"Executing query chain for context {context_id}")
            answer = chain.invoke(request.question)

            logger.info(f"Query successful for context {context_id}")

            return QueryResponse(
                answer=answer,
                sources=context_state["sources"],
                context_id=context_id,
                has_documents=True,
                document_count=context_state["document_count"]
            )

        except Exception as e:
            logger.error(
                f"Error querying documents for context {context_id}: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())

            return QueryResponse(
                answer="An error occurred while processing your question.",
                context_id=context_id,
                has_documents=True,
                document_count=context_state["document_count"],
                error=str(e)
            )

    def list_contexts(self) -> List[DocumentContext]:
        """List all active document contexts"""
        result = []
        for context_id, state in self.contexts.items():
            result.append(DocumentContext(
                context_id=context_id,
                document_count=state["document_count"],
                has_vector_store=state["vector_store"] is not None,
                sources=state["sources"]
            ))
        return result

    def delete_context(self, context_id: str) -> bool:
        """Delete a context and clean up its resources"""
        if context_id not in self.contexts:
            logger.warning(f"Context not found for deletion: {context_id}")
            return False

        # Clean up resources
        context_state = self.contexts[context_id]

        # Delete temporary files
        for temp_file in context_state["temp_files"]:
            try:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
            except Exception as e:
                logger.error(f"Error deleting temp file {temp_file}: {str(e)}")

        # Remove from contexts dictionary
        del self.contexts[context_id]
        logger.info(f"Deleted context: {context_id}")

        return True


# Create a global instance of the MCP Document Service
mcp_document_service = MCPDocumentService()
