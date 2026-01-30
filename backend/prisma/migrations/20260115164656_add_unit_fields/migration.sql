-- AlterEnum
ALTER TYPE "UnitType" ADD VALUE 'unit';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "unit_description" TEXT;
