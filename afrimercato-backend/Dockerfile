# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files (package-lock.json is optional)
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies
RUN npm ci --only=production || npm install --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
