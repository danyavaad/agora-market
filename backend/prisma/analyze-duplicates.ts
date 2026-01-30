import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });

    const duplicates: Record<string, any[]> = {};

    products.forEach(p => {
        const name = p.name.trim().toLowerCase();
        if (!duplicates[name]) {
            duplicates[name] = [];
        }
        duplicates[name].push(p);
    });

    console.log('--- Duplicate Product Analysis ---');
    for (const [name, list] of Object.entries(duplicates)) {
        if (list.length > 1) {
            console.log(`\nProduct: "${name}" (${list.length} entries)`);
            list.forEach(p => {
                console.log(`  - ID: ${p.id}, ImageURL: ${p.imageUrl}, CreatedAt: ${p.createdAt}`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
