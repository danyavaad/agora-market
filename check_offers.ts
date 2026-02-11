import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const offers = await prisma.offer.findMany({
        include: {
            product: true,
            producer: true,
        },
        orderBy: { week: 'desc' },
        take: 20
    });

    console.log('--- LATEST OFFERS ---');
    offers.forEach(o => {
        console.log(`- Product: ${o.product.name} | Producer: ${o.producer.name} | Week: ${o.week.toISOString().split('T')[0]} | Confirmed: ${o.isConfirmed} | Stock: ${o.availableQuantityKg || o.availableUnits}`);
    });

    const confirmedCount = await prisma.offer.count({ where: { isConfirmed: true } });
    const unconfirmedCount = await prisma.offer.count({ where: { isConfirmed: false } });

    console.log(`\nTotals: Confirmed=${confirmedCount}, Unconfirmed=${unconfirmedCount}`);

    await prisma.$disconnect();
}

main();
