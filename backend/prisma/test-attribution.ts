import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'nodo-caceres-id';
    const week = new Date();

    // Find this Monday
    const day = week.getDay();
    const diff = week.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(week.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    console.log(`Testing week: ${monday.toISOString()}`);

    const activeSeason = await prisma.season.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: {
            producerPriorities: {
                include: { producer: true }
            }
        }
    });

    const productsWithOffers = await prisma.product.findMany({
        where: {
            tenantId,
            offers: {
                some: { week: monday }
            }
        },
        include: {
            offers: {
                where: { week: monday },
                include: { producer: true }
            }
        }
    });

    console.log(`\nFound ${productsWithOffers.length} products with offers.`);

    productsWithOffers.forEach(p => {
        let primaryProducer = null;
        if (activeSeason) {
            const productPriorities = activeSeason.producerPriorities
                .filter(pp => pp.productId === p.id)
                .sort((a, b) => a.priorityOrder - b.priorityOrder);

            for (const pp of productPriorities) {
                const offer = p.offers.find(o => o.producerId === pp.producerId);
                const hasStock = (p.unitType === 'bunch' || p.unitType === 'unit')
                    ? (offer?.availableUnits || 0) > 0
                    : (Number(offer?.availableQuantityKg) || 0) > 0;

                if (hasStock) {
                    primaryProducer = { id: pp.producer.id, name: pp.producer.name };
                    break;
                }
            }
        }

        if (!primaryProducer && p.offers.length > 0) {
            const firstWithStock = p.offers.find(o =>
                (p.unitType === 'bunch' || p.unitType === 'unit')
                    ? (o.availableUnits || 0) > 0
                    : (Number(o.availableQuantityKg) || 0) > 0
            );
            if (firstWithStock) {
                primaryProducer = { id: firstWithStock.producer.id, name: firstWithStock.producer.name };
            }
        }

        console.log(`Product: "${p.name}" | Primary Producer: ${primaryProducer ? primaryProducer.name : 'NONE'}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
