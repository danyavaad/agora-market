# 🚀 Guía de Despliegue de Huertify en VPS Compartido

**Fecha:** 2026-02-02  
**VPS:** 135.181.26.104  
**Usuario:** dan  
**Ruta:** `/home/dan/huertify`

---

## 📋 Estado del VPS

- **BES Garden:** Corriendo en Docker (puerto 8080), no tocar.
- **Nginx:** Configurado para Huertify en puerto **8081** (`/etc/nginx/sites-available/huertify.conf`).
- **Node.js:** Versión 20.20.0 instalada (requerida para Huertify).
- **Puertos libres:** 3000 (frontend), 3001 (backend), 5433 (PostgreSQL), 5050 (pgAdmin).

---

## 🔧 Configuración Previa

### 1. Docker Compose

**⚠️ IMPORTANTE:** El VPS puede tener Docker Compose V1 (comando `docker-compose` con guion) o V2 (comando `docker compose` sin guion).

**Comprobar versión:**
```bash
docker-compose --version
# o
docker compose version
```

**Si tienes V1 (docker-compose con guion):**
```bash
docker-compose up -d
docker-compose ps
docker-compose down
```

**Si tienes V2 (docker compose sin guion):**
```bash
docker compose up -d
docker compose ps
docker compose down
```

**Archivo:** `docker-compose.yml` ya configurado con:
- PostgreSQL en puerto **5433** (evita conflicto con BES Garden en 5432)
- Volumen único: `huertify_pgdata`
- Red aislada: `huertify-network`
- pgAdmin en puerto **5050**

### 2. PM2

**Instalar PM2 globalmente:**

**Opción A (con sudo - recomendado):**
```bash
sudo npm install -g pm2
```

**Opción B (sin sudo, en directorio del usuario):**
```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g pm2
```

**Verificar instalación:**
```bash
pm2 --version
```

**Archivo:** `ecosystem.config.js` ya creado con:
- Frontend (Nuxt) en puerto **3000**
- Backend (NestJS) en puerto **3001**
- Logs en `/home/dan/huertify/logs/`

---

## 📦 Pasos de Despliegue

### Paso 1: Preparar entorno

```bash
# Conectarse al VPS como usuario dan
ssh besgarden-vps

# Ir al proyecto
cd ~/huertify

# Crear carpeta de logs
mkdir -p logs
```

### Paso 2: Levantar base de datos (Docker)

```bash
# Comprobar qué comando funciona en tu VPS
docker-compose --version  # Si funciona, usa docker-compose (V1)
docker compose version     # Si funciona, usa docker compose (V2)

# Levantar servicios (usar el comando que funcione)
docker-compose up -d       # V1
# o
docker compose up -d       # V2

# Verificar que están corriendo
docker-compose ps          # V1
# o
docker compose ps          # V2
```

**Deberías ver:**
- `huertify_db` (PostgreSQL) en puerto 5433
- `huertify_pgadmin` (pgAdmin) en puerto 5050

### Paso 3: Variables de entorno y base de datos

**Backend:** El archivo `.env` ya existe en `backend/.env` con:
```env
DATABASE_URL="postgresql://dbsudoluxgarden:luxgardentestpwd@localhost:5433/huertify"
```

**Migraciones de Prisma y Seed:**

```bash
cd ~/huertify/backend

# Ejecutar migraciones (crea las tablas)
npx prisma migrate deploy

# Ejecutar seed (pobla datos iniciales)
npx ts-node prisma/seed.ts
```

**Nota:** El seed crea:
- Tenant "Nodo Cáceres"
- 5 productores
- 12 consumidores
- 1 capitán y 1 repartidor
- 22 productos con ofertas semanales

**Frontend:** En `frontend/nuxt.config.ts` el `apiBase` está configurado como `http://localhost:3001`.  
En producción, Nginx hace proxy de `/api/` a `localhost:3001/api/`, así que debería funcionar. Si hay problemas CORS o de conexión, cambiar a `/api` (ruta relativa).

### Paso 4: Instalar dependencias, migraciones y compilar

**Backend:**
```bash
cd ~/huertify/backend
npm install

# Ejecutar migraciones de Prisma (crea tablas en la BD)
npx prisma migrate deploy

# Ejecutar seed (pobla datos iniciales)
npx ts-node prisma/seed.ts

# Compilar
npm run build
```

**Frontend:**
```bash
cd ~/huertify/frontend
npm install
npm run build
```

**Nota:** Nuxt genera `.output/server/index.mjs` después del build, que es el archivo que ejecuta PM2.

### Paso 5: Arrancar con PM2

```bash
cd ~/huertify

# Iniciar aplicaciones
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs huertify-frontend
pm2 logs huertify-backend

# Ver logs de ambos
pm2 logs

# Guardar configuración para auto-inicio
pm2 save
pm2 startup  # Seguir las instrucciones que aparezcan
```

**Comandos útiles de PM2:**
```bash
pm2 restart all          # Reiniciar todo
pm2 restart huertify-frontend  # Reiniciar solo frontend
pm2 restart huertify-backend   # Reiniciar solo backend
pm2 stop all             # Parar todo
pm2 delete all           # Eliminar procesos (cuidado)
pm2 monit                # Monitor en tiempo real
```

### Paso 6: Verificar despliegue

**En el navegador:**
- Frontend: http://135.181.26.104:8081
- Backend API: http://135.181.26.104:8081/api/

**Comprobar que los servicios están corriendo:**
```bash
# Docker
docker-compose ps  # o docker compose ps

# PM2
pm2 status

# Nginx (debería estar activo desde antes)
sudo systemctl status nginx
```

---

## 🔍 Troubleshooting

### Error: "unknown shorthand flag: 'd' in -d"

**Causa:** Versión antigua de Docker Compose o comando incorrecto.

**Solución:**
1. Comprobar versión: `docker-compose --version` o `docker compose version`
2. Usar el comando correcto según tu versión:
   - V1: `docker-compose up -d` (con guion)
   - V2: `docker compose up -d` (sin guion)

### Error: "Cannot connect to database"

**Causa:** PostgreSQL no está corriendo o puerto incorrecto.

**Solución:**
```bash
# Verificar que el contenedor está corriendo
docker-compose ps  # o docker compose ps

# Ver logs del contenedor
docker-compose logs db  # o docker compose logs db

# Reiniciar si es necesario
docker-compose restart db  # o docker compose restart db
```

### Error: "Port 3000 already in use"

**Causa:** Otro proceso usando el puerto 3000.

**Solución:**
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Matar el proceso si es necesario (cuidado)
sudo kill -9 <PID>
```

### PM2 no arranca las aplicaciones

**Causa:** Rutas incorrectas o archivos no compilados.

**Solución:**
```bash
# Verificar que los builds existen
ls -la ~/huertify/backend/dist/main.js
ls -la ~/huertify/frontend/.output/server/index.mjs

# Ver logs de PM2
pm2 logs

# Recompilar si falta
cd ~/huertify/backend && npm run build
cd ~/huertify/frontend && npm run build
```

### Frontend no conecta al backend

**Causa:** `apiBase` en `nuxt.config.ts` apunta a `localhost:3001` pero debería usar `/api` (ruta relativa) o la URL del VPS.

**Solución:**
Editar `frontend/nuxt.config.ts`:
```typescript
runtimeConfig: {
  public: {
    apiBase: '/api'  // Ruta relativa (Nginx hace proxy)
    // o
    apiBase: 'http://135.181.26.104:8081/api'  // URL completa
  }
}
```

Luego recompilar:
```bash
cd ~/huertify/frontend
npm run build
pm2 restart huertify-frontend
```

---

## 📝 Checklist de Despliegue

- [ ] Nginx configurado (`/etc/nginx/sites-available/huertify.conf` activado)
- [ ] Node.js 20 instalado (`node -v`)
- [ ] PM2 instalado (`pm2 --version`)
- [ ] Docker Compose funcionando (`docker-compose --version` o `docker compose version`)
- [ ] Base de datos corriendo (`docker-compose ps` o `docker compose ps`)
- [ ] Migraciones de Prisma ejecutadas (`npx prisma migrate deploy`)
- [ ] Seed ejecutado (`npx ts-node prisma/seed.ts`)
- [ ] Backend compilado (`ls ~/huertify/backend/dist/main.js`)
- [ ] Frontend compilado (`ls ~/huertify/frontend/.output/server/index.mjs`)
- [ ] PM2 corriendo (`pm2 status` muestra ambos procesos)
- [ ] Frontend accesible (http://135.181.26.104:8081)
- [ ] Backend API accesible (http://135.181.26.104:8081/api/)

---

## 🔄 Actualización de Código

Cuando actualices código en el repositorio:

```bash
# En tu máquina local
cd ~/Proyectos/BEFORE/Huertify
git pull  # o el método que uses

# Copiar al VPS
scp -r ~/Proyectos/BEFORE/Huertify/. dan@135.181.26.104:~/huertify/

# En el VPS
ssh besgarden-vps
cd ~/huertify

# Recompilar
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Reiniciar PM2
pm2 restart all
```

---

## 📚 Referencias

- Documentación de BES Garden: `00-DOCS/HUERTIFY_SHARED_VPS.md` (en el repo de BES Garden)
- Nginx config: `/etc/nginx/sites-available/huertify.conf`
- PM2 ecosystem: `~/huertify/ecosystem.config.js`
- Docker Compose: `~/huertify/docker-compose.yml`

---

**Última actualización:** 2026-02-02
