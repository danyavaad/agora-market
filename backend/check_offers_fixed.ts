import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const offers = await prisma.offer.findMany({
            include: {
                product: true,
                producer: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        console.log('\n--- LATEST OFFERS IN DATABASE ---');
        if (offers.length === 0) {
            console.log('No offers found.');
        }
        offers.forEach(o => {
            console.log(`[ID: ${o.id}]`);
            console.log(`- Product: ${o.product?.name} (ID: ${o.productId})`);
            console.log(`- Producer: ${o.producer?.name} (ID: ${o.producerId})`);
            console.log(`- Week: ${o.week.toISOString().split('T')[0]}`);
            console.log(`- Confirmed: ${o.isConfirmed}`);
            console.log(`- Stock (Kg): ${o.availableQuantityKg}`);
            console.log(`- Stock (Units): ${o.availableUnits}`);
            console.log(`- Photo URL: ${o.photoUrl}`);
            console.log(`- Unit Type: ${o.product?.unitType}`);
            console.log('---------------------------');
        });

        const products = await prisma.product.findMany({
            where: { id: { in: offers.map(o => o.productId) } }
        });
        console.log('\n--- PRODUCT UNIT TYPES ---');
        products.forEach(p => {
            console.log(`- ${p.name}: ${p.unitType}`);
        });

    } catch (error) {
        console.error('Error running script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
