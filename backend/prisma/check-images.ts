import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();

    console.log(`Total products in DB: ${products.length}`);
    console.log('--- Full Product List ---');
    products.forEach(p => {
        console.log(`ID: ${p.id} | Name: "${p.name}" | ImageURL: ${p.imageUrl}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
