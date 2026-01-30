import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMappings: Record<string, string[]> = {
    'berenjenablanca.png': ['berenjena blanca preciosa', 'berenjena'],
    'brocolifractal.png': ['brócoli fractal', 'brócoli', 'brocoli'],
    'calabacinluna.png': ['calabacín luna', 'calabacin'],
    'coliflorpurpura.png': ['coliflor púrpura real', 'coliflor'],
    'Esparragotriguer.png': ['espárrago triguero de rivera', 'espárrago', 'esparrago'],
    'judiaverdeplana.png': ['judía verde plana extra', 'judía', 'judia'],
    'miel.png': ['miel de milflores silvestres', 'miel de encina pura', 'miel'],
    'patata.png': ['patata agria de secano', 'patata'],
    'pimientosdelpadron.png': ['pimiento de padrón peligroso', 'pimiento', 'pimientos'],
    'puerro.png': ['puerro fino de arena', 'puerro'],
    'tomatecherry.png': ['tomate cherry'],
    'tomatepera.png': ['tomate pera'],
    'tomaterosa.png': ['tomate rosa de aliseda', 'tomate'],
};

async function main() {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to sync.`);

    for (const product of products) {
        const productNameLower = product.name.toLowerCase();
        let bestImage = '';

        for (const [image, keywords] of Object.entries(imageMappings)) {
            if (keywords.some(kw => productNameLower.includes(kw))) {
                bestImage = image;
                // Priority to more specific matches could be added here, but this is fine for now
            }
        }

        if (bestImage) {
            const imageUrl = `/images/products/${bestImage}`;
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl },
            });
            console.log(`Updated ${product.name} with ${imageUrl}`);
        } else {
            console.warn(`No image found for product: ${product.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
