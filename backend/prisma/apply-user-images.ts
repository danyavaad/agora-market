import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMappings: Record<string, string[]> = {
    '/images/products/brocolifractal.png': ['brócoli fractal', 'brócoli', 'brocoli'],
    '/images/products/berenjenablanca.png': ['berenjena blanca preciosa', 'berenjena'],
    '/images/products/coliflorpurpura.png': ['coliflor púrpura real', 'coliflor'],
    '/images/products/acelgaarcoiris.png': ['acelga arcoíris', 'acelga'],
    '/images/products/cebollamorada.png': ['cebolla morada de verano', 'cebolla'],
    '/images/products/judiaverdeplana.png': ['judía verde plana extra', 'judía', 'judia'],
    '/images/products/kalerizadobio.png': ['kale rizado bio', 'kale'],
    '/images/products/apio.png': ['apio crujiente de montaña', 'apio'],
    '/images/products/pimientosdelpadron.png': ['pimiento de padrón peligroso', 'pimiento', 'pimientos'],
    '/images/products/chirivia.png': ['chirivía dulce', 'chirivía', 'chirivia'],
    '/images/products/rucula.png': ['rúcula selvática picante', 'rúcula', 'rucula'],
    '/images/products/batatadulce.png': ['batata dulce de la huerta', 'batata'],
    '/images/products/patata.png': ['patata agria de secano', 'patata'],
    '/images/products/calabacinluna.png': ['calabacín luna (redondo)', 'calabacín', 'calabacin'],
    '/images/products/rabano.png': ['rábano sandía (red meat)', 'rábano', 'rabano'],
    '/images/products/ajonegro.png': ['ajo negro fermentado', 'ajo negro', 'ajo'],
    '/images/products/miel.png': ['miel de milflores silvestres', 'miel de encina pura', 'miel'],
    '/images/products/puerro.png': ['puerro fino de arena', 'puerro'],
    '/images/products/tomaterosa.png': ['tomate rosa de aliseda', 'tomate rosa'],
    '/images/products/espinacahojaancha.png': ['espinaca de hoja ancha', 'espinaca'],
    '/images/products/Esparragotriguer.png': ['espárrago triguero de rivera', 'espárrago', 'esparrago'],
    '/images/products/tomatecherry.png': ['tomate cherry'],
    '/images/products/tomatepera.png': ['tomate pera'],
};

async function main() {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products in DB.`);

    for (const product of products) {
        const productNameLower = product.name.toLowerCase();
        let bestImage = '';

        // Check mapping
        for (const [path, keywords] of Object.entries(imageMappings)) {
            if (keywords.some(kw => productNameLower.includes(kw))) {
                bestImage = path;
            }
        }

        if (bestImage) {
            await prisma.product.update({
                where: { id: product.id },
                data: { imageUrl: bestImage },
            });
            console.log(`✓ Updated: "${product.name}" -> ${bestImage}`);
        } else {
            console.warn(`! No mapping found for: "${product.name}"`);
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
