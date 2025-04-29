# Use Python 3.12.8 as base image
FROM python:3.12.8-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=80

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    libpq-dev \
    python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first to leverage Docker cache
COPY ./backend/requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the backend directory content into the container
COPY ./backend /app/

# Make port available to the world outside this container
EXPOSE 80

# Command to run the application
CMD ["python", "main.py"]