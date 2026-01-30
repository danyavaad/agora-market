# 🎨 UI/UX Design Specifications 2025 - Huertify

Este documento define la estética visual y la experiencia de usuario para la versión 2025 de Huertify.

## 1. Sistema de Diseño: "Organic Orchard (El Huerto Vivo)"

### 🌌 Estética General
*   **Tendencia:** Artesanal, Natural, "Farm-to-Table" UI.
*   **Modo:** Natural Dimmed (No modo oscuro total, sino tonos tierra oscuros y verdes musgo).
*   **Atmósfera:** Cálida, táctil, texturas reales.
*   **Elemento Visual:** Hojas reconocibles de huerta (calabaza, tomate, albahaca, puerro). Luz natural filtrada (Golden Hour).

### 🎨 Paleta de Colores
*   **Primario:** **Verde Albahaca** (Fresco, natural).
*   **Secundario:** **Tierra Mojada / Marrón Café** (Fondos y estructura).
*   **Acentos:** Naranja Calabaza, Rojo Tomate (Para llamadas a la acción y notificaciones).
*   **Fondo:** Textura sutil de papel reciclado oscuro o pizarra limpia.

### 🧱 Componentes Clave
*   **Cabecera:** Mate, sin brillos excesivos. Texturas suaves.
*   **Navegación:** Barra orgánica, colores sólidos mate.
*   **Tarjetas:** Bordes muy redondeados (Rounded-XL).

---

## 2. Pantallas Principales

### 👨‍🌾 A. Pantalla del Productor (Dashboard)
**Objetivo:** Gestión rápida de cosecha bajo el sol (Alto contraste, botones grandes).

*   **Cabecera:** "Hola, Carlos. Hoy toca: Tomates y Lechugas". (Datos de clima integrados).
*   **Cuerpo (Bento Grid):**
    *   **Tarjeta Grande (2x2):** Estado de Cosecha (Gráfico circular % entrega).
    *   **Tarjeta Stock (2x1):** Stock Estimado vs Real con selector gigante (+/-).
    *   **KPIs (1x1):** Precio actual, Clima.
*   **Acción Principal:** Botón "Validar Cosecha" (Verde brillante, orgánico).
*   **Lógica UX:** Si `Stock Real < Estimado` -> Modal de alerta: "¿Avisamos al Productor Suplente?".

### 🛒 B. Pantalla del Consumidor (Shop & Pooling)
**Objetivo:** Compra visual y ahorro logístico colaborativo.

*   **Listado:** Fotos macro de alta calidad. Badges de origen.
*   **Checkout (Pooling):**
    *   **Banner "El Gancho":** "¡Tu vecino Pedro ha pedido también! Ahorra 1,50€ eligiendo el punto compartido".
    *   **Mapa:** Visualización de radio de 500m con puntos de encuentro.
    *   **Botón:** "Unirme al envío de mi zona".

### 📦 C. Pantalla del Capitán (Centro de Distribución)
**Objetivo:** Gestión de almacén visual ("Estantería Virtual").

*   **Layout:** Grilla que representa físicamente las baldas del local.
*   **Estados de Balda:**
    *   ⬜ **Gris:** Vacía.
    *   🟨 **Amarilla:** Pendiente de recepción.
    *   🟩 **Verde:** Pedido completo (Listo para entrega).
*   **Interacción:** Tocar balda verde -> Abre Escáner QR para entrega/pickup.

### 🚚 D. Pantalla del Repartidor (Modo Ruta)
**Objetivo:** Navegación segura y gestión de cobros.

*   **Mapa:** Full screen, alta legibilidad. Ruta óptima trazada.
*   **Controles:** Diseñados para uso con una mano.
*   **Panel Inferior (Ficha Entrega):** Dirección, Botón WhatsApp, Botón "Cobrar".
*   **Cierre:** Resumen de efectivo: "Llevas 145€ recaudados. Entregar al Capitán".

### 🔑 E. Pantalla de Login & Acceso
**Objetivo:** Sentirse en casa, en el huerto.

*   **Fondo:** Fotografía macro artística de hojas de huerto reales (nervaduras de acelga, textura de hoja de calabaza, hojas de tomate). Luz suave de atardecer.
*   **Paleta:** Verdes naturales, ocres y marrones.
*   **Central Card:** Tarjeta estilo "Papel Vegetal" (ligeramente traslúcido, textura mate).
*   **Inputs:** Estilo clásico renovado, fondo beige suave.
*   **Botón:** Color Tomate o Calabaza vivo para destacar sobre el verde.

