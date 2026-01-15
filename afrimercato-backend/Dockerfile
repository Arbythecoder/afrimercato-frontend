# Use Node.js LTS base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy entire application (including node_modules)
COPY . .

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
