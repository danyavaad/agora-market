# TODO Huertify

Lista de tareas pendientes para futuras implementaciones y mejoras técnicas.

## Technical Debt & Infrastructure

- [ ] **Real-time Updates (WebSockets)**:
    - Implementar `socket.io` en Backend (NestJS Gateway).
    - Implementar cliente WebSocket en Frontend (Nuxt Pluging/Composable).
    - Objetivos: Actualización instantánea de stock en `shop` cuando un productor añade oferta, y actualización de pedidos entrantes en `producer/panel`.
    - Prioridad: Media-Alta (Mejora UX significativa).

## Future Features

- [ ] **Smart Delivery Pooling**:
    - [ ] Add mechanism to update User coordinates (latitude/longitude).
    - [ ] Algorithm to group orders within 5km radius for shared delivery.
    - [ ] UI for "Invite Neighbors" or "Join Delivery Group".
