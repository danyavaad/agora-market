-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bin_number" INTEGER,
ADD COLUMN     "delivery_distance_km" DECIMAL(65,30),
ADD COLUMN     "delivery_fee" DECIMAL(65,30) DEFAULT 0.00;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
