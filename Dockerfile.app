# App Service Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY app/ .

# Expose port
EXPOSE 3000

# Run the app in development mode
CMD ["npm", "run", "dev"]
