# --- Build Stage ---
FROM node:20-slim AS builder

WORKDIR /app

# Copy config files
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies (including devDependencies for build & prisma generate)
RUN npm ci

# Copy source code
COPY backend/ .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Stage ---
FROM node:20-slim AS runner

# Install OpenSSL if needed (usually present, but ensuring compatibility)
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist

# Copy generated Prisma Client (crucial!)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

USER node

EXPOSE 3000

CMD ["node", "dist/src/main"]
