import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    const groups: Record<string, any[]> = {};

    products.forEach(p => {
        const key = p.name.trim().toLowerCase();
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
    });

    for (const [name, list] of Object.entries(groups)) {
        if (list.length <= 1) continue;

        console.log(`\nProcessing duplicates for: "${name}"`);

        const sorted = [...list].sort((a, b) => {
            if (a.imageUrl && !b.imageUrl) return -1;
            if (!a.imageUrl && b.imageUrl) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const canonical = sorted[0];
        const toDelete = sorted.slice(1);

        console.log(`  Keeping: ${canonical.id} (Image: ${canonical.imageUrl})`);

        for (const dup of toDelete) {
            console.log(`  Merging duplicate: ${dup.id}`);

            const duplicateOffers = await prisma.offer.findMany({ where: { productId: dup.id } });
            for (const off of duplicateOffers) {
                const existing = await prisma.offer.findUnique({
                    where: {
                        producerId_productId_week: {
                            producerId: off.producerId,
                            productId: canonical.id,
                            week: off.week
                        }
                    }
                });

                if (existing) {
                    const newKg = (Number(existing.availableQuantityKg || 0) + Number(off.availableQuantityKg || 0));
                    await prisma.offer.update({
                        where: { id: existing.id },
                        data: {
                            availableQuantityKg: newKg.toString(),
                            availableUnits: (existing.availableUnits || 0) + (off.availableUnits || 0)
                        }
                    });
                    await prisma.offer.delete({ where: { id: off.id } });
                } else {
                    await prisma.offer.update({
                        where: { id: off.id },
                        data: { productId: canonical.id }
                    });
                }
            }

            const duplicateAllocations = await prisma.seasonAllocation.findMany({ where: { productId: dup.id } });
            for (const alloc of duplicateAllocations) {
                const existing = await prisma.seasonAllocation.findUnique({
                    where: {
                        seasonId_producerId_productId: {
                            seasonId: alloc.seasonId,
                            producerId: alloc.producerId,
                            productId: canonical.id
                        }
                    }
                });

                if (existing) {
                    await prisma.seasonAllocation.delete({ where: { id: alloc.id } });
                } else {
                    await prisma.seasonAllocation.update({
                        where: { id: alloc.id },
                        data: { productId: canonical.id }
                    });
                }
            }

            await prisma.orderItem.updateMany({ where: { productId: dup.id }, data: { productId: canonical.id } });
            await prisma.feedPost.updateMany({ where: { productId: dup.id }, data: { productId: canonical.id } });
            await prisma.review.updateMany({ where: { productId: dup.id }, data: { productId: canonical.id } });
            await prisma.producerPriority.updateMany({ where: { productId: dup.id }, data: { productId: canonical.id } });

            await prisma.product.delete({ where: { id: dup.id } });
        }
    }
    console.log('\nCleanup complete.');
}

main()
    .catch(e => {
        console.error('Error during cleanup:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
