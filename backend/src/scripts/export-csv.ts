
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: {
            name: true,
            unitType: true,
            pricePerKg: true,
            pricePerBunch: true,
            pricePerUnit: true,
        }
    });

    const header = 'Name,UnitType,PricePerKg,PricePerBunch,PricePerUnit\n';
    const rows = products.map(p => {
        return `"${p.name}",${p.unitType},${p.pricePerKg || ''},${p.pricePerBunch || ''},${p.pricePerUnit || ''}`;
    }).join('\n');

    fs.writeFileSync('products_export.csv', header + rows);
    console.log('Exported to products_export.csv');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
