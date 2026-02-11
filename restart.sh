#!/bin/bash

# Abort on error
set -e

echo "🔄 Reiniciando ecosistema Huertify (PM2 + Docker)..."

# 1. Backend build (opcional pero recomendado si hay cambios)
if [[ $* == *--build* ]]; then
  echo "📦 Reconstruyendo Backend..."
  cd backend && npm run build && cd ..
  echo "📦 Reconstruyendo Frontend..."
  cd frontend && npm run build && cd ..
fi

# 2. Reiniciar procesos PM2
pm2 restart all

# 3. Reiniciar contenedor de base de datos
docker-compose restart db

echo "✅ ¡Ecosistema reiniciado!"
echo "📍 Nota: Usa './restart.sh --build' para aplicar cambios de código nuevos."
