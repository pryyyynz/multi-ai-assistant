import os
from typing import List
import numpy as np
from langchain_community.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv

load_dotenv()

class EmbeddingsUtil:
    """Utility class for working with text embeddings."""
    
    def __init__(self):
        """Initialize the embeddings model."""
        self.model = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )
    
    def get_text_embedding(self, text: str) -> List[float]:
        """
        Generate embeddings for a single text.
        
        Args:
            text: The text to embed
            
        Returns:
            List of embedding values
        """
        return self.model.embed_query(text)
    
    def get_batch_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            List of embedding vectors
        """
        return self.model.embed_documents(texts)
    
    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Compute cosine similarity between two embeddings.
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            Similarity score between 0 and 1
        """
        # Convert to numpy arrays
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Compute cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm_vec1 = np.linalg.norm(vec1)
        norm_vec2 = np.linalg.norm(vec2)
        
        # Avoid division by zero
        if norm_vec1 == 0 or norm_vec2 == 0:
            return 0
            
        return dot_product / (norm_vec1 * norm_vec2)