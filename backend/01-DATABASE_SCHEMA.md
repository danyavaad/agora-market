# 🗄️ Database Schema Documentation

This document serves as a reference for the Huertify database schema (PostgreSQL), managed via Prisma.

---

## 🏗️ Core Models

### 🏢 Tenant (`tenants`)
Represents a "Node" or "Cooperative Group". This is the top-level entity.
*   `id`: UUID
*   `name`: Display name of the Node.
*   `currencyCode`: Default currency (e.g., EUR).
*   `kmRate`: rate for delivery calculations.
*   `seasons`: Relation to managing rotation cycles.

### 👤 User (`users`)
A user within a Tenant throughout the system.
*   `role`: Enum (`producer`, `consumer`, `captain`, `admin`).
*   `email`: Unique email address.
*   `password`: Hashed password for authentication.
*   `tenantId`: Foreign Key linking to Tenant.
*   `isActive`: Boolean flag for soft deletion.

---

## 🔄 Rotation & Priorities (New)

### 🌞 Season (`seasons`)
Tracks specific time periods (e.g., "Summer 2026") for crop planning.
*   `status`: `DRAFT`, `ACTIVE`, `ARCHIVED`.
*   `producerRotation`: JSON Array storing the ordered list of Producer IDs for this season's picking order.

### 🗳️ ProducerPriority (`producer_priorities`)
Stores the crop preferences for a producer in a specific season.
*   `seasonId`: Link to the Season.
*   `producerId`: Link to the User (Producer).
*   `priorityOrder`: The rank of the choice (1 = First Choice, 2 = Second Choice).
*   **Constraint**: Unique combination of `[seasonId, producerId, priorityOrder]` ensures a producer has only one "1st choice".

---

## 🛒 E-commerce & Logistics

### 📦 Product (`products`)
Items available for sale.
*   `unitType`: Enum (`weight_fixed`, `weight_variable`, `bunch`, `unit`).
*   `unitDescription`: Specifics for bunch-type products or unit details (e.g., "Manojo 300g").

### 🏷️ Offer (`offers`)
Weekly availability from a producer.
*   `week`: Date (Monday of the week).
*   `availability`: Quantity limits (`availableQuantityKg`, `availableUnits`).
*   `photoUrl`: Link to a photo of the specific produce being offered (New).

### 📝 Order (`orders`)
Consumer orders for a specific week.
*   `status`: `pending`, `confirmed`, `delivered`, `cancelled`.
*   `pickupQrToken`: Unique token for picking up the order.

### 🚚 Delivery (`deliveries`)
Logistics tracking for bringing produce to the node.
*   `binNumber`: Physical bin identifier.
*   `deliveryQrToken`: Unique token for dropping off produce.

---

## 📈 Financials

### 💳 Credit (`credits`)
Store credit for consumers (typically from refunds/incidents).
*   `amount`: Decimal value.
*   `isUsed`: Boolean flag.

### 💰 Settlement (`settlements`)
Weekly financial summary for a producer.
*   `netAmount`: Final payout calculated from sales - refunds.

---

## ⚠️ Incidents & Events

### 🚨 OrderItem Helper (`order_items`)
Links Orders to Products. Contains **Incident Data**.
*   `hasIncident`: Boolean.
*   `incidentType`: `overripe`, `underweight`, etc.
*   `incidentPhotoUrl`: Proof of incident.

### 📰 FeedPost (`feed_posts`)
Social updates from producers (e.g., "Planting started!").

---

## 🔑 Indexes & Constraints (Performance)

| Table | Index Columns | Purpose |
| :--- | :--- | :--- |
| `producer_priorities` | `[seasonId, producerId, priorityOrder]` | Unique constraint to prevent duplicate ranks per producer. |
| `offers` | `[producerId, productId, week]` | Unique constraint ensuring one offer per product/week. |
| `orders` | `[tenantId, week]` | Optimizes filtering orders by active week. |
| `deliveries` | `[deliveryQrToken]` | Fast lookup by QR scan. |
