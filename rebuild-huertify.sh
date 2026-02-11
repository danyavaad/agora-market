#!/bin/bash
set -e  # Exit on error

echo "🛑 Stopping Huertify containers..."
docker-compose -f huertify-docker-compose.prod.yml down

echo "🗑️ Removing old images to force rebuild..."
docker rmi huertify-app 2>/dev/null || true
docker rmi huertify-frontend 2>/dev/null || true
docker rmi huertify_frontend 2>/dev/null || true

echo "🏗️ Building Huertify (this may take a few minutes)..."
docker-compose -f huertify-docker-compose.prod.yml build --no-cache

echo "🚀 Starting containers..."
docker-compose -f huertify-docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

echo "📊 Container status:"
docker ps --filter "name=huertify" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Deployment complete!"
echo "   Backend:  http://localhost:3002"
echo "   Frontend: http://localhost:8888"
echo ""
echo "📜 Showing logs (Ctrl+C to exit, containers will keep running)..."
docker-compose -f huertify-docker-compose.prod.yml logs -f
