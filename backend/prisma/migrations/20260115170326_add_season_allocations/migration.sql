-- CreateTable
CREATE TABLE "season_allocations" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "producer_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "season_allocations_season_id_producer_id_product_id_key" ON "season_allocations"("season_id", "producer_id", "product_id");

-- AddForeignKey
ALTER TABLE "season_allocations" ADD CONSTRAINT "season_allocations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_allocations" ADD CONSTRAINT "season_allocations_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_allocations" ADD CONSTRAINT "season_allocations_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season_allocations" ADD CONSTRAINT "season_allocations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
