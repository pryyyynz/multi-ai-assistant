# Use Python 3.12.8 as base image with slim version to reduce size
FROM python:3.12.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080
ENV PYTHONPATH=/app
# Disable ChromaDB telemetry
ENV ANONYMIZED_TELEMETRY=False

# Set work directory
WORKDIR /app

# Install system dependencies - reduced to essentials
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY ./backend/requirements.txt /app/requirements.txt

# Install dependencies in stages to better utilize caching and avoid timeouts
# First install smaller dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Install ChromaDB separately with a longer timeout
RUN pip install --no-cache-dir chromadb==1.0.7 --timeout 300

# Then install CPU-only PyTorch to reduce size and memory
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Now install remaining requirements with --no-deps for ChromaDB to avoid reinstalling it
RUN grep -v "chromadb" requirements.txt > requirements_no_chroma.txt && \
    pip install --no-cache-dir -r requirements_no_chroma.txt

# Copy the backend directory content into the container
COPY ./backend /app/

# Ensure the data directory exists and has proper permissions
RUN mkdir -p /app/data && chmod -R 755 /app/data

# Create a directory for ChromaDB persistence
RUN mkdir -p /app/chroma_db && chmod -R 755 /app/chroma_db

# Make port available
EXPOSE 8080

# Set lower worker count and increase timeout
CMD uvicorn main:app --host=0.0.0.0 --port=${PORT} --workers=1 --timeout-keep-alive=120