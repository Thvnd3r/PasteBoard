# Multi-stage build
# Stage 1: Build the server
FROM node:18-alpine AS server-builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm install

# Copy source code and config
COPY server/src ./src
COPY server/tsconfig.json ./

# Compile TypeScript
RUN npm run build

# Stage 2: Build the client
FROM node:18-alpine AS client-builder

WORKDIR /app

# Copy package files
COPY client/package*.json ./
RUN npm install

# Copy source code
COPY client/src ./src
COPY client/tsconfig.json ./
COPY client/public ./public

# Build the React app
RUN npm run build

# Stage 3: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy server build
COPY --from=server-builder /app/dist ./dist
COPY --from=server-builder /app/node_modules ./node_modules
COPY server/package*.json ./

# Copy client build
COPY --from=client-builder /app/build /client/build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
