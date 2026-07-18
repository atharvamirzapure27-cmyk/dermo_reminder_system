# Multi-stage Dockerfile for Dermo Reminder System

# --- Stage 1: Build Backend & Frontend ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency configs
COPY package*.json ./
RUN npm ci

# Copy backend files
COPY . .

# Build frontend assets
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# --- Stage 2: Production Release ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy backend packages
COPY package*.json ./
RUN npm ci --only=production

# Copy backend runtime files
COPY . .

# Copy compiled frontend assets from Stage 1 into backend's static directory
COPY --from=builder /app/frontend/dist /app/frontend/dist

EXPOSE 3001
CMD ["npm", "start"]
