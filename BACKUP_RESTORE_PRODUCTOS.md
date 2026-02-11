# 📦 Backup y Restore de Productos (con imágenes)

**Objetivo:** Copiar productos y sus imágenes desde local a producción para tener la misma base de datos.

---

## 🔍 Verificar estructura de imágenes

Los productos tienen un campo `imageUrl` que puede ser:
- URL externa (ej: `https://images.unsplash.com/...`)
- Ruta relativa (ej: `/uploads/products/tomate.jpg`)
- Ruta absoluta local

**Verificar en local:**
```bash
# En tu máquina local
cd ~/Proyectos/BEFORE/Huertify/backend
npx prisma studio
# O consultar directamente:
psql -h localhost -p 5433 -U dbsudoluxgarden -d huertify -c "SELECT id, name, image_url FROM products LIMIT 5;"
```

---

## 📤 Opción 1: Backup completo de la tabla products (PostgreSQL)

### En local (máquina de desarrollo)

**1. Exportar solo la tabla products:**
```bash
# Conectarse a la BD local
pg_dump -h localhost -p 5433 -U dbsudoluxgarden -d huertify \
  --table=products \
  --data-only \
  --column-inserts \
  > productos_backup.sql
```

**2. Si las imágenes son archivos locales, copiar también las imágenes:**
```bash
# Si las imágenes están en una carpeta (ej: backend/uploads/products/)
# Identificar la ruta desde imageUrl en la BD
# Copiar las imágenes al VPS
scp -r ~/Proyectos/BEFORE/Huertify/backend/uploads/products/* \
  dan@135.181.26.104:~/huertify/backend/uploads/products/
```

---

## 📥 Restore en producción (VPS)

### En el VPS

**1. Conectarse a la BD de producción:**
```bash
ssh besgarden-vps
cd ~/huertify
```

**2. Copiar el archivo SQL al VPS (si lo creaste localmente):**
```bash
# Desde tu máquina local
scp productos_backup.sql dan@135.181.26.104:~/huertify/
```

**3. Restaurar productos en producción:**
```bash
# En el VPS
cd ~/huertify

# Opción A: Si quieres reemplazar todos los productos
docker-compose exec db psql -U dbsudoluxgarden -d huertify -c "TRUNCATE TABLE products CASCADE;"
docker-compose exec -T db psql -U dbsudoluxgarden -d huertify < productos_backup.sql

# Opción B: Si quieres hacer merge (upsert) - más seguro
# Necesitarías un script que haga INSERT ... ON CONFLICT DO UPDATE
```

---

## 🔄 Opción 2: Usar Prisma para exportar/importar (más seguro)

### En local

**1. Crear script de exportación:**
```bash
cd ~/Proyectos/BEFORE/Huertify/backend
```

Crear `scripts/export-products.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportProducts() {
  const products = await prisma.product.findMany({
    include: {
      // Incluir relaciones si las necesitas
    }
  });
  
  fs.writeFileSync(
    'products-export.json',
    JSON.stringify(products, null, 2)
  );
  
  console.log(`Exported ${products.length} products`);
  await prisma.$disconnect();
}

exportProducts();
```

**2. Ejecutar exportación:**
```bash
npx ts-node scripts/export-products.ts
```

**3. Copiar JSON y imágenes al VPS:**
```bash
scp products-export.json dan@135.181.26.104:~/huertify/backend/
# Si hay imágenes locales:
scp -r backend/uploads/products/* dan@135.181.26.104:~/huertify/backend/uploads/products/
```

### En producción (VPS)

**1. Crear script de importación:**
```bash
cd ~/huertify/backend
```

Crear `scripts/import-products.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importProducts() {
  const products = JSON.parse(
    fs.readFileSync('products-export.json', 'utf-8')
  );
  
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        imageUrl: product.imageUrl,
        // ... otros campos
      },
      create: product
    });
  }
  
  console.log(`Imported ${products.length} products`);
  await prisma.$disconnect();
}

importProducts();
```

**2. Ejecutar importación:**
```bash
npx ts-node scripts/import-products.ts
```

---

## 🖼️ Opción 3: Backup completo de la BD (más simple)

### En local

**1. Backup completo de la BD:**
```bash
pg_dump -h localhost -p 5433 -U dbsudoluxgarden -d huertify \
  --data-only \
  > huertify_backup.sql
```

**2. Copiar al VPS:**
```bash
scp huertify_backup.sql dan@135.181.26.104:~/huertify/
```

### En producción (VPS)

**⚠️ CUIDADO:** Esto reemplazará TODOS los datos de producción.

```bash
# Backup de producción primero (por si acaso)
docker-compose exec db pg_dump -U dbsudoluxgarden -d huertify > backup_produccion_$(date +%Y%m%d).sql

# Restaurar desde local
docker-compose exec -T db psql -U dbsudoluxgarden -d huertify < huertify_backup.sql
```

---

## 📋 Checklist

- [ ] Verificar cómo se almacenan las imágenes (`imageUrl` en BD)
- [ ] Si son archivos locales, identificar la carpeta donde están
- [ ] Exportar productos desde local (Opción 1, 2 o 3)
- [ ] Copiar imágenes al VPS (si son archivos locales)
- [ ] Restaurar productos en producción
- [ ] Verificar que las imágenes se muestran correctamente

---

## 🔍 Verificar después del restore

```bash
# En el VPS
docker-compose exec db psql -U dbsudoluxgarden -d huertify \
  -c "SELECT COUNT(*) FROM products;"
  
docker-compose exec db psql -U dbsudoluxgarden -d huertify \
  -c "SELECT name, image_url FROM products WHERE image_url IS NOT NULL LIMIT 5;"
```

---

**Recomendación:** Usa la **Opción 2 (Prisma)** si quieres control fino sobre qué datos copiar. Usa la **Opción 3 (pg_dump completo)** si quieres una copia exacta de toda la BD.
