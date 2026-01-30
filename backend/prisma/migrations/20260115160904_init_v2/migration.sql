-- CreateEnum
CREATE TYPE "Role" AS ENUM ('producer', 'consumer', 'captain', 'admin');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('weight_fixed', 'weight_variable', 'bunch');

-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('overripe', 'underweight', 'wrong_item');

-- CreateEnum
CREATE TYPE "QrType" AS ENUM ('delivery', 'pickup');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('planting', 'frost', 'pest', 'harvest', 'other');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL DEFAULT 'EUR',
    "km_rate" DECIMAL(65,30) NOT NULL DEFAULT 0.30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "password_hash" TEXT,
    "phone" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latin_name" TEXT,
    "local_name" TEXT,
    "unit_type" "UnitType" NOT NULL,
    "price_per_kg" DECIMAL(65,30),
    "min_weight_kg" DECIMAL(65,30),
    "max_weight_kg" DECIMAL(65,30),
    "items_per_bunch_min" INTEGER,
    "items_per_bunch_max" INTEGER,
    "price_per_bunch" DECIMAL(65,30),
    "nutritional_info" JSONB,
    "recipes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "status" "SeasonStatus" NOT NULL DEFAULT 'DRAFT',
    "producer_rotation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_priorities" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "priority_order" INTEGER NOT NULL,
    "producer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producer_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "producer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "week" DATE NOT NULL,
    "available_quantity_kg" DECIMAL(65,30),
    "available_units" INTEGER,
    "available_min_kg" DECIMAL(65,30),
    "available_max_kg" DECIMAL(65,30),
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "week" DATE NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "pickup_qr_token" UUID,
    "pickup_confirmed_at" TIMESTAMP(3),
    "pickup_confirmed_by" TEXT,
    "total_estimated" DECIMAL(65,30),
    "total_final" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "estimated_quantity_kg" DECIMAL(65,30),
    "estimated_units" INTEGER,
    "estimated_price" DECIMAL(65,30),
    "assigned_to_producer" TEXT,
    "actual_weight_kg" DECIMAL(65,30),
    "final_price" DECIMAL(65,30),
    "has_incident" BOOLEAN NOT NULL DEFAULT false,
    "incident_type" "IncidentType",
    "incident_photo_url" TEXT,
    "credit_issued" DECIMAL(65,30) DEFAULT 0.00,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "producer_id" TEXT NOT NULL,
    "bin_number" INTEGER NOT NULL,
    "delivery_qr_token" UUID,
    "confirmed_at" TIMESTAMP(3),
    "confirmed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "order_item_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "reason" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_in_order" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_tokens" (
    "token" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "QrType" NOT NULL,
    "resource_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "producer_id" TEXT NOT NULL,
    "product_id" TEXT,
    "message" TEXT,
    "photo_url" TEXT,
    "event_type" "EventType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "producer_id" TEXT NOT NULL,
    "week" DATE NOT NULL,
    "total_sales" DECIMAL(65,30),
    "total_refunds" DECIMAL(65,30),
    "total_weight_adjustments" DECIMAL(65,30),
    "net_amount" DECIMAL(65,30),
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "closed_by" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "producer_priorities_season_id_producer_id_priority_order_key" ON "producer_priorities"("season_id", "producer_id", "priority_order");

-- CreateIndex
CREATE INDEX "offers_tenant_id_idx" ON "offers"("tenant_id");

-- CreateIndex
CREATE INDEX "offers_product_id_week_producer_id_idx" ON "offers"("product_id", "week", "producer_id");

-- CreateIndex
CREATE UNIQUE INDEX "offers_producer_id_product_id_week_key" ON "offers"("producer_id", "product_id", "week");

-- CreateIndex
CREATE UNIQUE INDEX "orders_pickup_qr_token_key" ON "orders"("pickup_qr_token");

-- CreateIndex
CREATE INDEX "orders_tenant_id_week_idx" ON "orders"("tenant_id", "week");

-- CreateIndex
CREATE INDEX "orders_pickup_qr_token_idx" ON "orders"("pickup_qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_delivery_qr_token_key" ON "deliveries"("delivery_qr_token");

-- CreateIndex
CREATE INDEX "deliveries_delivery_qr_token_idx" ON "deliveries"("delivery_qr_token");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_producer_id_week_key" ON "settlements"("producer_id", "week");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_priorities" ADD CONSTRAINT "producer_priorities_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_priorities" ADD CONSTRAINT "producer_priorities_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_priorities" ADD CONSTRAINT "producer_priorities_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_priorities" ADD CONSTRAINT "producer_priorities_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_pickup_confirmed_by_fkey" FOREIGN KEY ("pickup_confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_assigned_to_producer_fkey" FOREIGN KEY ("assigned_to_producer") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_used_in_order_fkey" FOREIGN KEY ("used_in_order") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
