-- Coop-Red Database Schema
-- Generated based on user requirements

-- 1. tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,            -- "Nodo Cáceres"
    currency_code CHAR(3) NOT NULL DEFAULT 'EUR',
    km_rate NUMERIC(4,2) NOT NULL DEFAULT 0.30,  -- €/km
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    role TEXT NOT NULL CHECK (role IN ('producer', 'consumer', 'captain', 'admin')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. products
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,                    -- "Tomate"
    latin_name TEXT,                       -- "Solanum lycopersicum"
    local_name TEXT,
    unit_type TEXT NOT NULL CHECK (unit_type IN ('weight_fixed', 'weight_variable', 'bunch')),
    -- For weight_fixed: price per kg
    price_per_kg NUMERIC(10,2),

    -- For weight_variable:
    min_weight_kg NUMERIC(5,2),
    max_weight_kg NUMERIC(5,2),

    -- For bunch:
    items_per_bunch_min INT,
    items_per_bunch_max INT,
    price_per_bunch NUMERIC(10,2),

    nutritional_info JSONB,
    recipes JSONB[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. producer_priorities (Draft de temporada)
CREATE TABLE producer_priorities (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    round INT NOT NULL,                   -- 1 = primera ronda
    priority_order INT NOT NULL,          -- 1 = P1, 2 = P2, etc.
    producer_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    is_main BOOLEAN NOT NULL DEFAULT true, -- true = cultivo estrella, false = suplente
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, round, priority_order)
);

-- 5. offers (Oferta semanal del productor)
CREATE TABLE offers (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    producer_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    week DATE NOT NULL,                   -- Lunes de la semana de oferta
    available_quantity_kg NUMERIC(10,2),  -- Para peso fijo
    available_units INT,                  -- Para manojos o unidades
    available_min_kg NUMERIC(10,2),       -- Para peso variable: kg mínimo disponible
    available_max_kg NUMERIC(10,2),       -- kg máximo estimado
    is_confirmed BOOLEAN DEFAULT false,   -- ¿Validado por el productor 24h antes?
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(producer_id, product_id, week)
);

-- 6. orders
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    consumer_id UUID NOT NULL REFERENCES users(id),
    week DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
    pickup_qr_token UUID UNIQUE,          -- Para recogida
    pickup_confirmed_at TIMESTAMPTZ,
    pickup_confirmed_by UUID REFERENCES users(id), -- Capitán
    total_estimated NUMERIC(10,2),
    total_final NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. order_items
CREATE TABLE order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    -- Estimación inicial:
    estimated_quantity_kg NUMERIC(10,2),
    estimated_units INT,
    estimated_price NUMERIC(10,2),

    -- Asignación real (cascada P1 → P2):
    assigned_to_producer UUID REFERENCES users(id), -- P1, P2 o P3
    actual_weight_kg NUMERIC(10,2),                 -- Tras cosecha
    final_price NUMERIC(10,2),

    -- Para incidencias:
    has_incident BOOLEAN DEFAULT false,
    incident_type TEXT CHECK (incident_type IN ('overripe', 'underweight', 'wrong_item')),
    incident_photo_url TEXT,
    credit_issued NUMERIC(10,2) DEFAULT 0.00
);

-- 8. deliveries
CREATE TABLE deliveries (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id),
    producer_id UUID NOT NULL REFERENCES users(id),
    bin_number INT NOT NULL,                      -- Balda #5
    delivery_qr_token UUID UNIQUE,
    confirmed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES users(id),        -- Capitán
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. credits
CREATE TABLE credits (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    consumer_id UUID NOT NULL REFERENCES users(id),
    order_item_id UUID REFERENCES order_items(id),
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,                         -- 'underweight', 'wrong_item', etc.
    is_used BOOLEAN DEFAULT false,
    used_in_order UUID REFERENCES orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. qr_tokens (Optional/Centralized)
CREATE TABLE qr_tokens (
    token UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('delivery', 'pickup')),
    resource_id UUID NOT NULL,                    -- ID de delivery u order
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. feed_posts (Muro de la Huerta)
CREATE TABLE feed_posts (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    producer_id UUID NOT NULL REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    message TEXT,
    photo_url TEXT,
    event_type TEXT CHECK (event_type IN ('planting', 'frost', 'pest', 'harvest', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. settlements (Liquidación final)
CREATE TABLE settlements (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    producer_id UUID NOT NULL REFERENCES users(id),
    week DATE NOT NULL,
    total_sales NUMERIC(10,2),
    total_refunds NUMERIC(10,2),
    total_weight_adjustments NUMERIC(10,2),
    net_amount NUMERIC(10,2),
    is_closed BOOLEAN DEFAULT false,
    closed_by UUID REFERENCES users(id),          -- Capitán
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(producer_id, week)
);

-- Indexes
CREATE INDEX ON offers (tenant_id);
CREATE INDEX ON orders (tenant_id, week);
CREATE INDEX ON offers (product_id, week, producer_id);
CREATE INDEX ON deliveries (delivery_qr_token);
CREATE INDEX ON orders (pickup_qr_token);
