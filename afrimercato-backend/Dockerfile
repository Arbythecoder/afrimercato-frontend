# Use Node.js LTS base image
FROM node:18-alpine

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (rebuild native modules for Alpine)
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
