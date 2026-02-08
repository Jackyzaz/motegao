# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Install nmap and other security tools for worker tasks
RUN apt-get update && apt-get install -y \
    nmap \
    dnsutils \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install gobuster
RUN wget -q https://github.com/OJ/gobuster/releases/download/v3.6.0/gobuster_3.6.0_Linux_x86_64.tar.gz -O /tmp/gobuster.tar.gz \
    && tar -xzf /tmp/gobuster.tar.gz -C /usr/local/bin gobuster \
    && chmod +x /usr/local/bin/gobuster \
    && rm /tmp/gobuster.tar.gz

# Copy the requirements file and install dependencies
# This leverages Docker's cache, as requirements.txt changes less often than code
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy the entire motegao package and scripts
COPY motegao/ /app/motegao/
COPY scripts/ /app/scripts/

# Copy wordlists and install them
COPY wordlists/ /app/wordlists/
RUN mkdir -p /usr/share/wordlists && cp /app/wordlists/* /usr/share/wordlists/

# Expose port 8000 for the FastAPI application
EXPOSE 8000

# Define the command to run the application
# Use uvicorn to run the FastAPI app defined in motegao/cmd/api.py
CMD ["uvicorn", "motegao.cmd.api:app", "--host", "0.0.0.0", "--port", "8000"]
