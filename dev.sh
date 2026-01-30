#!/bin/bash

# Project: Huertify Orchestrator
# Purpose: Start Database, Backend, and Frontend concurrently.

echo "🌿 Starting Huertify Ecosystem..."

# 1. Start Docker Services (Database & pgAdmin)
echo "🐘 Starting Database (Docker)..."
docker compose up -d

# 2. Wait for DB to be ready (optional but recommended)
echo "⏳ Waiting for Database to initialize..."
sleep 2

# 3. Start Backend & Frontend in background
echo "🚀 Launching Backend (Port 3001) and Frontend (Port 3000)..."

# Using a subshell to keep the output organized or simply running them in background
(cd backend && npm run start:dev) &
BACKEND_PID=$!

(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "✅ Services are launching!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:3001"
echo "   - pgAdmin:  http://localhost:5050"
echo ""
echo "Press Ctrl+C to stop all services (Note: Docker containers will keep running, use 'docker compose down' to stop them)."

# Handle termination
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

wait
