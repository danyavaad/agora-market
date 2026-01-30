# 🗺️ Hoja de Ruta (Roadmap) y Lógica de Negocio - Coop-Red / Huertify

Este documento define la funcionalidad *core* y los flujos de usuario del proyecto, basado en la visión original.

## 1. Fase de Planificación y Multitenencia (Pre-Temporada)
*   **Modelo Multitenant:**
    *   La app permite crear "Nodos" independientes (ej. Nodo Cáceres, Nodo Badajoz).
    *   Cada nodo tiene su propia configuración: Moneda, Tarifa de km, Catálogo de productores.
*   **Sistema de Draft (Prioridades):**
    *   Antes de sembrar, se realiza un sorteo de orden.
    *   **Rondas:** El Productor 1 (P1) elige su cultivo estrella. P2 elige el siguiente. Al terminar la vuelta, se asignan Segundas y Terceras Prioridades (suplentes).
    *   **Compromiso:** Generación de contrato digital donde los productores se comprometen a cubrir la demanda estimada.

## 2. Configuración de Productos y Stock Dinámico
Al dar de alta la oferta (domingo), se define la Unidad de Venta:
*   **Venta por Peso (Kg):** Productos estándar (tomates, patatas).
*   **Venta por Unidad con Peso Variable:** (Sandías, Calabazas, etc.)
    *   Productor define Rango (ej. "7kg - 12kg").
    *   Advertencia al consumidor: "Precio estimado, ajuste final tras cosecha".
*   **Venta por Manojo:** Definición de contenido (ej. "6-8 unidades") y precio fijo.

## 3. Proceso de Pedido y Logística
*   **Carrito con Cascada (Pooling de Stock):**
    *   Los pedidos descuentan primero del stock del P1.
    *   Si P1 agota, pasa a P2 automáticamente.
*   **Cálculo de Envío:** Tarifa base (ej. 0.3€/km).
*   **Logística Colaborativa (Pooling de Envío):**
    *   Si dos clientes están a < 500m, se ofrece punto de encuentro.
    *   Coste de envío se divide entre ambos.

## 4. Fase de Cosecha y Ajuste de Peso Real
*   **Validación:** P1 confirma lo recogido 24h antes.
*   **Ajuste de Unidades Pesadas:**
    *   Productor pesa el item específico para un pedido (ej. "Sandía Pedido #101: 8.4kg").
    *   Ticket del cliente se actualiza al instante.
*   **Protocolo de Suplencia:**
    *   Si P1 reporta falta de stock -> Alerta Push a P2 para cubrir con su excedente.

## 5. Logística de Distribución (El Puesto)
*   **Capitán del Puesto:** Rol rotativo semanal.
*   **Picking Guiado por Balda:** App indica al productor dónde dejar la mercancía (ej. "Balda #5").
*   **Gestión de Efectivo:** Capitán cobra importe exacto y recibe recaudación de repartidores.

## 6. Transparencia y Muro de la Huerta
*   **Feed Social:** Fotos diarias (siembra, incidencias climáticas).
*   **Ficha Botánica:** Nombre latín, local, nutrición, recetas.
*   **Educación:** Comunicación de incidencias para generar empatía (ej. heladas).

## 7. Post-Venta e Incidencias
*   **Encuesta:** Valoración tras recepción.
*   **Sistema de Incidencias:** Tipos (maduro, peso, error) con foto obligatoria.
*   **Monedero Virtual:** Devoluciones generan "Créditos de Cooperativa" para el próximo pedido.

## 8. Liquidación Final
*   **Informe de Sobres:** Desglose automático (Ventas - Devoluciones + Ajustes).
*   **Cierre de Ciclo:** Capitán marca "Cerrado" al entregar los sobres físicos.
