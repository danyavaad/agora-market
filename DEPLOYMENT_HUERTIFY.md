# Huertify Deployment Guide (Isolated)

This document describes how to deploy **Huertify** independently of the **Besgarden** application on the same VPS.

## Architecture
Huertify runs in its own set of Docker containers to avoid conflicts with Besgarden.

| Service | Container Name | Internal Port | Host Port | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `huertify-frontend` | 80 | **8888 (Public)** | Nginx serving `.output/public` + API Proxy |
| **Backend** | `huertify-app` | 3000 | **3002** | NestJS App |
| **Database** | `huertify_db` | 5432 | **5433** | Shared DB instance |

## Files
-   `huertify-docker-compose.prod.yml`: The Docker Compose configuration.
-   `Dockerfile`: Custom build for Huertify Backend (NestJS).
-   `nginx/huertify.conf`: Custom Nginx configuration.

## Commands

### 1. Build & Start
To build and start the application (detached mode):
```bash
docker-compose -f huertify-docker-compose.prod.yml up -d --build
```

### 2. View Logs
To see logs for all Huertify services:
```bash
docker-compose -f huertify-docker-compose.prod.yml logs -f
```

### 3. Stop
To stop the application:
```bash
docker-compose -f huertify-docker-compose.prod.yml down
```

### 4. Rebuild Frontend
If you make changes to `.vue` files:
```bash
cd frontend
npm run generate
cd ..
docker restart huertify-frontend
```

## Troubleshooting
-   **Port Conflicts:** Ensure ports 8888 and 3001 are free.
-   **Database:** The app connects to the existing `huertify_db` container via the `huertify_huertify-network`.
