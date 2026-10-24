# syntax=docker/dockerfile:1
# ==============================================================================
# StockFlow Frontend - Multi-stage Dockerfile (React 19 + TypeScript + Vite + Nginx)
# ==============================================================================

# --- Stage 1: Build Static Assets ---
FROM node:22-alpine AS builder

WORKDIR /app

# Cache dependency installations
COPY package*.json ./
RUN npm ci || npm install

# Copy source and config files
COPY . .

# Build production bundle to dist/
RUN npm run build

# --- Stage 2: Serve with Nginx Alpine ---
FROM nginx:1.27-alpine

# Clean up default nginx static website
RUN rm -rf /usr/share/nginx/html/*

# Copy built artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
