# 📑 Coop-Red: Documento Maestro de Especificaciones (Versión Final)

## 1. Arquitectura y Modelo de Negocio
*   **Multitenant SaaS:** Plataforma para múltiples "nodos" o comunidades independientes (Cáceres, Badajoz, etc.). Cada uno con sus productores, clientes y reglas locales.
*   **Seguridad y Privacidad:** Aislamiento total mediante **PostgreSQL RLS (Row Level Security)**. Los datos de un nodo son inaccesibles para otros.

## 2. Planificación Agrícola: El Sistema de "Draft"
*   **Sorteo de Prioridades:** Orden de elección por sorteo (1º Manolo, 2º Ana...).
*   **Rondas de Selección:** 
    *   **Ronda 1:** El 1º elige su cultivo estrella -> **Prioridad 1 (P1)**.
    *   **Rondas Sucesivas:** Se asignan **Prioridad 2 (P2)** y **Prioridad 3 (P3)** como suplentes.
*   **Compromiso de Siembra:** Generación automática del plan de producción.

## 3. Gestión de Productos: Pesos y Medidas
*   **Por Peso (Kg):** Estándar (ej. patatas).
*   **Por Unidad con Rango de Peso:** (Sandías, Calabazas, etc.)
    *   Productor define rango (7kg-12kg).
    *   Aviso Legal: "Importe final se ajustará al peso real tras la cosecha".
*   **Por Manojo:** Composición definida por productor (ej. espárragos). Precio cerrado.

## 4. El Ciclo Semanal: De la Huerta al Puesto
### A. Domingo: Apertura del Puesto
*   Productores indican disponibilidad en el puesto (sin competencia, basándose en el Draft).
*   **Fotos del Producto:** Los productores pueden añadir una foto real de su cosecha semanal para el puesto.
*   Consumidores piden. El sistema asigna por **Cooperación de Prioridad** (P1 -> P2).

### B. Cosecha y Validación (24h antes)
*   **Ajuste de Peso Real:** Productor introduce peso exacto por pedido.
*   **Alerta de Stock:** Si P1 falla -> Notificación Push inmediata al P2 para cubrir demanda.
*   **Generación de QR de Entrega:** Vincula mercancía con pedidos.

### C. El Día de la Distribución (Logística QR) - Gestión del Capitán
#### Flujo del Productor (Carga):
1.  **Llegada:** Escaneo de QR de Productor en tablet del centro.
2.  **Ubicación (Picking):** La app muestra baldas: "Bolsa 5kg Tomate -> Balda #12".
3.  **Validación:** Marca como completado.

#### Flujo del Consumidor (Recogida):
1.  **Identificación:** Cliente muestra su QR de Pedido.
2.  **Cobro Ajustado:** Capitán ve precio final (ajustado por pesos reales).
3.  **Entrega:** App indica: "Recoger de baldas #12 y #14".
4.  **Pago:** Confirmación en efectivo y cierre de pedido.

#### Flujo de Delivery (Reparto):
1.  **Hoja de Ruta:** Repartidor escanea QRs de pedidos a llevar.
2.  **Pooling Geográfico:** Entrega en punto común si están a < 500m (coste dividido).
3.  **Confirmación:** Escaneo de QR del cliente al entregar + cobro.
4.  **Retorno:** Capitán escanea QR de repartidor para validar dinero recaudado.

## 5. Transparencia y Comunidad
*   **Muro de la Huerta:** Feed social con fotos (siembra, incidencias).
*   **Ficha Botánica/Educativa:** Nombre latín, nutrición, recetas.

## 6. Post-Venta y Finanzas
*   **Encuesta/Reclamaciones:** Fotos obligatorias para incidencias.
*   **Comunicación Directa:** Chat entre cliente y productor responsable.
*   **Monedero Virtual:** Devoluciones como créditos para la próxima compra.
*   **Liquidación de Sobres:** Informe automático al final del día ("Meted XX€ en sobre de Manolo").
