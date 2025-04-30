# Use Python 3.12.8 as base image with slim version to reduce size
FROM python:3.12.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app
# Disable ChromaDB telemetry
ENV ANONYMIZED_TELEMETRY=False
# Set ChromaDB directory
ENV CHROMA_DB_DIR=/app/data/chroma_db

# Set work directory
WORKDIR /app

# Install system dependencies - focused on what's needed for vector DB
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    git \
    sqlite3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY ./backend/requirements.txt /app/requirements.txt

# Install dependencies in stages to better utilize caching and avoid timeouts
# First install smaller dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install ChromaDB separately with a longer timeout
RUN pip install --no-cache-dir chromadb==1.0.7 --timeout 300

# Then install CPU-only PyTorch and sentence-transformers to reduce size and memory
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir sentence-transformers

# Now install remaining requirements with --no-deps for ChromaDB to avoid reinstalling it
RUN grep -v "chromadb\|torch\|torchvision\|sentence-transformers" requirements.txt > requirements_filtered.txt || true
RUN pip install --no-cache-dir -r requirements_filtered.txt

# Copy the backend directory content into the container
COPY ./backend /app/

# Ensure the data directory exists with proper permissions
RUN mkdir -p /app/data && chmod -R 755 /app/data
RUN mkdir -p /app/data/chroma_db && chmod -R 777 /app/data/chroma_db

# Make port available
EXPOSE 8080

# Set lower worker count and increase timeout
CMD uvicorn main:app --host=0.0.0.0 --port=${PORT} --workers=1 --timeout-keep-alive=120