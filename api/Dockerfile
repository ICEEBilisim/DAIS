# Use official python image
FROM python:3.10-slim

# Install system dependencies required for audio processing
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Start FastAPI application using the PORT environment variable injected by Render
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
