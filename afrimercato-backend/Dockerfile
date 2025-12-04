# Fly.io optimized Dockerfile for Afrimercato Backend
# Based on official Fly.io Node.js template

ARG NODE_VERSION=18

FROM node:${NODE_VERSION}-alpine as base
LABEL fly_launch_runtime="Node.js"

# Set production environment
ENV NODE_ENV="production"

# Install packages needed for deployment
RUN apk update && \
    apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY . .

# Expose port (Fly.io uses 8080 internally)
EXPOSE 8080

# Start the server
CMD [ "node", "server.js" ]
