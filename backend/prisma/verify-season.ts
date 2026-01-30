import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'nodo-caceres-id';

    // Check for any season
    let season = await prisma.season.findFirst({
        where: { tenantId }
    });

    if (!season) {
        console.log('No season found, creating a default ACTIVE season...');
        season = await prisma.season.create({
            data: {
                id: 'default-active-season',
                tenantId,
                name: 'Temporada Invierno 2026',
                startDate: new Date('2026-01-01'),
                status: 'ACTIVE',
                isActive: true
            }
        });
    } else if (season.status !== 'ACTIVE') {
        console.log(`Updating existing season ${season.id} to ACTIVE...`);
        season = await prisma.season.update({
            where: { id: season.id },
            data: { status: 'ACTIVE', isActive: true }
        });
    } else {
        console.log(`Verified active season: ${season.name} (${season.id})`);
    }

    // Create some basic priorities if they don't exist
    const products = await prisma.product.findMany({ where: { tenantId } });
    const producers = await prisma.user.findMany({ where: { tenantId, role: 'producer' } });

    if (producers.length > 0) {
        console.log('Assigning priorities...');
        for (const p of products) {
            const priorities = await prisma.producerPriority.findMany({ where: { productId: p.id, seasonId: season.id } });
            if (priorities.length === 0) {
                // Assign first producer as P1
                await prisma.producerPriority.create({
                    data: {
                        tenantId,
                        seasonId: season.id,
                        productId: p.id,
                        producerId: producers[0].id,
                        priorityOrder: 1
                    }
                });
                console.log(`  Added P1 for ${p.name}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
