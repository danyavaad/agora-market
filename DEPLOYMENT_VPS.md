# 🚀 Guía: Compartir VPS entre BES Garden y Huertify

> [!CAUTION]
> ### 🛑 EXTREMA PRECAUCIÓN: ENTORNO COMPARTIDO
> Este VPS aloja actualmente **BES Garden** en producción. Es **CRÍTICO** no sobreescribir ni modificar ninguna de sus carpetas, procesos de PM2 o archivos de configuración de Nginx sin extrema diligencia.
> - **NO IMPROVISAR**: Seguir esta guía estrictamente.
> - **RESPETAR NGINX**: BES Garden ya usa Nginx. No borrar archivos en `/etc/nginx/sites-enabled/` ni reusar bloques de servidor existentes.
> - **SÓLO PRODUCCIÓN**: Esta guía asume que ambos sistemas deben coexistir armónicamente sin interferencias.

**Fecha:** 2026-01-28  
**Servidor:** 135.181.26.104  
**Objetivo:** Ejecutar ambas aplicaciones en el mismo VPS sin conflictos

---

## 📋 Arquitectura Propuesta

### Opción 1: Nginx Reverse Proxy Principal (RECOMENDADA) ⭐

**Ventajas:**
- ✅ Un solo punto de entrada (puerto 80/443)
- ✅ Subdominios limpios (besgarden.tudominio.com, huertify.tudominio.com)
- ✅ SSL/TLS centralizado con Let's Encrypt
- ✅ Mejor gestión de recursos
- ✅ Logs centralizados

**Estructura:**
```
Internet
   ↓
Nginx (Host, puerto 80/443)
   ├─→ besgarden.tudominio.com → Docker Compose (BES Garden)
   │   ├─ Frontend Nginx (puerto 8080 interno)
   │   └─ Backend Node.js (puerto 3000 interno)
   │
   └─→ huertify.tudominio.com → PM2 + Docker (Huertify)
       ├─ Frontend Nuxt.js (puerto 3000 host)
       ├─ Backend NestJS (puerto 3001 host)
       └─ PostgreSQL (puerto 5433 host)
```

---

## 🔧 Configuración Paso a Paso

### 1. Instalar Nginx en el Host (si no está instalado)

```bash
# Conectar al VPS
ssh dan@135.181.26.104

# Instalar Nginx
sudo apt update
sudo apt install nginx -y

# Verificar instalación
sudo systemctl status nginx
```

### 2. Configurar Nginx Reverse Proxy

**Archivo:** `/etc/nginx/sites-available/besgarden.conf`

```nginx
server {
    listen 80;
    server_name besgarden.tudominio.com;  # ⚠️ Cambiar por tu dominio real

    # Redirigir a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Por ahora, proxy a Docker
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Para WebSockets (si BES Garden los usa en el futuro)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

**Archivo:** `/etc/nginx/sites-available/huertify.conf`

```nginx
server {
    listen 80;
    server_name huertify.tudominio.com;  # ⚠️ Cambiar por tu dominio real

    # Redirigir a HTTPS (después de configurar SSL)
    # return 301 https://$server_name$request_uri;

    client_max_body_size 50m;  # Para subir archivos grandes

    # Frontend Nuxt.js (puerto 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Para HMR de Nuxt (desarrollo) o WebSockets
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Backend NestJS (puerto 3001)
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Habilitar sitios:**

```bash
# Crear enlaces simbólicos
sudo ln -s /etc/nginx/sites-available/besgarden.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/huertify.conf /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

### 3. Configurar Docker Compose para Huertify

**Archivo:** `/home/dan/huertify/docker-compose.yml`

```yaml
services:
  db:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - huertify_pgdata:/var/lib/postgresql/data
    ports:
      - "5433:5432"  # ⚠️ IMPORTANTE: Puerto externo 5433 para evitar conflicto con BES Garden
    networks:
      - huertify-network

volumes:
  huertify_pgdata:  # ⚠️ Nombre único para evitar conflicto con BES Garden

networks:
  huertify-network:
    driver: bridge
```

**⚠️ IMPORTANTE:**
- Puerto **5433** en el host (mapeado a 5432 interno)
- Volumen con nombre único: `huertify_pgdata` (no `pgdata`)
- Red separada: `huertify-network` (no `app-network`)

---

### 4. Configurar PM2 para Huertify

**Instalar PM2:**

```bash
npm install -g pm2
```

**Archivo:** `/home/dan/huertify/ecosystem.config.js`

```javascript
module.exports = {
  apps: [
    {
      name: 'huertify-frontend',
      cwd: '/home/dan/huertify/frontend',
      script: 'npm',
      args: 'run start',  // Nuxt en modo producción
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        NITRO_PORT: 3000,
        NITRO_HOST: '0.0.0.0'
      },
      error_file: '/home/dan/huertify/logs/frontend-error.log',
      out_file: '/home/dan/huertify/logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    },
    {
      name: 'huertify-backend',
      cwd: '/home/dan/huertify/backend',
      script: 'dist/main.js',  // NestJS compilado
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_PORT: 5433,  // ⚠️ Puerto externo de Docker
        DB_NAME: process.env.DB_NAME,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD
      },
      error_file: '/home/dan/huertify/logs/backend-error.log',
      out_file: '/home/dan/huertify/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
};
```

**Comandos PM2:**

```bash
# Iniciar aplicaciones
cd /home/dan/huertify
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs huertify-frontend
pm2 logs huertify-backend

# Reiniciar
pm2 restart all

# Guardar configuración para auto-inicio
pm2 save
pm2 startup  # Seguir instrucciones para crear servicio systemd
```

---

### 5. Variables de Entorno

**Archivo:** `/home/dan/huertify/.env` (backend)

```env
# Database
DB_HOST=localhost
DB_PORT=5433  # ⚠️ Puerto externo de Docker
DB_NAME=huertify_prod
DB_USER=huertify_user
DB_PASSWORD=tu_password_seguro

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# App
NODE_ENV=production
PORT=3001
```

**Archivo:** `/home/dan/huertify/frontend/.env.production`

```env
NUXT_PUBLIC_API_BASE_URL=https://huertify.tudominio.com/api
NUXT_PUBLIC_APP_URL=https://huertify.tudominio.com
```

---

### 6. Configurar SSL/TLS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificados (ejecutar para cada dominio)
sudo certbot --nginx -d besgarden.tudominio.com
sudo certbot --nginx -d huertify.tudominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

**Después de SSL, actualizar Nginx:**

Los archivos de configuración se actualizarán automáticamente con `listen 443 ssl;` y redirecciones HTTP → HTTPS.

---

## 📊 Resumen de Puertos

| Servicio | Puerto Host | Puerto Interno | Notas |
|----------|-------------|----------------|-------|
| **BES Garden** | | | |
| Frontend Nginx | 8080 | 80 (Docker) | Proxy desde Nginx host |
| Backend Node.js | - | 3000 (Docker) | Solo interno |
| PostgreSQL | - | 5432 (Docker) | Solo interno |
| **Huertify** | | | |
| Frontend Nuxt.js | 3000 | - | PM2 en host |
| Backend NestJS | 3001 | - | PM2 en host |
| PostgreSQL | 5433 | 5432 (Docker) | Mapeado desde Docker |
| **Nginx Host** | 80/443 | - | Reverse proxy principal |

---

## 🔒 Consideraciones de Seguridad

### 1. Firewall (UFW)

```bash
# Permitir solo puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verificar estado
sudo ufw status
```

### 2. Variables de Entorno Seguras

```bash
# Crear archivo protegido para variables sensibles
sudo chmod 600 /home/dan/huertify/.env
sudo chmod 600 /home/dan/besgarden-config/db.env
```

### 3. Backups Separados

```bash
# Backup BES Garden
docker exec besgarden-db-1 pg_dump -U ${DB_USER} ${DB_NAME} > /backups/besgarden_$(date +%Y%m%d).sql

# Backup Huertify
docker exec huertify-db-1 pg_dump -U ${DB_USER} ${DB_NAME} > /backups/huertify_$(date +%Y%m%d).sql
```

---

## 🚀 Scripts de Deploy para Huertify

**Archivo:** `/home/dan/huertify/deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Deploy Huertify"
echo "=================="

# 1. Pull código
git pull origin main

# 2. Backend
cd backend
npm ci
npm run build
cd ..

# 3. Frontend
cd frontend
npm ci
npm run build
cd ..

# 4. Reiniciar PM2
pm2 restart ecosystem.config.js

# 5. Verificar estado
pm2 status

echo "✅ Deploy completado"
```

**Hacer ejecutable:**

```bash
chmod +x /home/dan/huertify/deploy.sh
```

---

## 📝 Checklist de Implementación

### Fase 1: Preparación
- [ ] Instalar Nginx en el host
- [ ] Crear subdominios DNS (besgarden.tudominio.com, huertify.tudominio.com)
- [ ] Configurar archivos Nginx para ambos proyectos
- [ ] Verificar que Nginx funciona (`sudo nginx -t`)

### Fase 2: Huertify Setup
- [ ] Crear directorio `/home/dan/huertify`
- [ ] Configurar `docker-compose.yml` con puerto 5433
- [ ] Iniciar PostgreSQL con Docker Compose
- [ ] Ejecutar migraciones Prisma (`npx prisma migrate deploy`)
- [ ] Instalar PM2 globalmente
- [ ] Crear `ecosystem.config.js`
- [ ] Compilar backend (`npm run build`)
- [ ] Compilar frontend (`npm run build`)
- [ ] Iniciar procesos con PM2
- [ ] Verificar que frontend responde en puerto 3000
- [ ] Verificar que backend responde en puerto 3001

### Fase 3: Nginx Reverse Proxy
- [ ] Configurar `/etc/nginx/sites-available/huertify.conf`
- [ ] Habilitar sitio (`ln -s`)
- [ ] Reiniciar Nginx
- [ ] Probar acceso desde navegador (huertify.tudominio.com)

### Fase 4: SSL/TLS
- [ ] Instalar Certbot
- [ ] Obtener certificados para ambos dominios
- [ ] Verificar renovación automática
- [ ] Probar acceso HTTPS

### Fase 5: Monitoreo y Mantenimiento
- [ ] Configurar PM2 startup (`pm2 startup`)
- [ ] Crear scripts de backup
- [ ] Configurar logs rotation
- [ ] Documentar procedimientos de deploy

---

## 🐛 Troubleshooting

### Error: Puerto 3000 ya en uso

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Si es BES Garden, verificar que está en Docker (puerto interno)
# Si es otro proceso, cambiar puerto en ecosystem.config.js
```

### Error: Puerto 5433 ya en uso

```bash
# Verificar que BES Garden no está usando 5433
docker ps | grep postgres

# Si hay conflicto, cambiar puerto en docker-compose.yml de Huertify
```

### Error: Nginx no redirige correctamente

```bash
# Verificar logs
sudo tail -f /var/log/nginx/error.log

# Verificar configuración
sudo nginx -t

# Verificar que servicios están corriendo
pm2 status
docker ps
```

### Error: Base de datos no conecta

```bash
# Verificar que PostgreSQL está corriendo
docker ps | grep huertify-db

# Verificar variables de entorno
cat /home/dan/huertify/.env | grep DB_

# Probar conexión manual
docker exec -it huertify-db-1 psql -U ${DB_USER} -d ${DB_NAME}
```

---

## 📚 Referencias

- [Nginx Reverse Proxy](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

---

**Última actualización:** 2026-01-28
