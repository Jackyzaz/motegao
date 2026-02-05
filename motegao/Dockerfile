# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
# This leverages Docker's cache, as requirements.txt changes less often than code
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the entire motegao package and scripts
COPY motegao/ /app/motegao/
COPY scripts/ /app/scripts/

# Expose port 8000 for the FastAPI application
EXPOSE 8000

# Define the command to run the application
# Use uvicorn to run the FastAPI app defined in motegao/cmd/api.py
CMD ["uvicorn", "motegao.cmd.api:app", "--host", "0.0.0.0", "--port", "8000"]
