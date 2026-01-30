import 'dotenv/config';
import { PrismaClient, Role, UnitType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function getMondayUTC(offsetWeeks = 0) {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const utcMonday = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0));

    if (offsetWeeks !== 0) {
        utcMonday.setUTCDate(utcMonday.getUTCDate() + (offsetWeeks * 7));
    }
    return utcMonday;
}

async function main() {
    const thisMonday = getMondayUTC(0);
    const nextMonday = getMondayUTC(1);
    const tenantId = 'nodo-caceres-id';
    const password = await bcrypt.hash('password123', 10);

    console.log('--- Massive Seeding: El Puesto de la Huerta ---');

    // 1. Tenant
    await prisma.tenant.upsert({
        where: { id: tenantId },
        update: {},
        create: { id: tenantId, name: 'Nodo Cáceres' },
    });

    // 2. Producers (5)
    const producers = [
        { name: 'Bea "La de la Miel"', email: 'bea@la-colmena.es', address: 'Calle Colmena 1, Cáceres', lat: 39.475, lon: -6.372 },
        { name: 'Abuelo Paco', email: 'paco@huerto-tradicion.es', address: 'Camino del Río 5, Cáceres', lat: 39.478, lon: -6.375 },
        { name: 'Hortelanos Reales', email: 'info@hortelanos-reales.es', address: 'Avenida del Campo 12, Cáceres', lat: 39.480, lon: -6.370 },
        { name: 'Tierra y Libertad', email: 'cooperativa@tierra.org', address: 'Plaza del Grano 3, Cáceres', lat: 39.472, lon: -6.378 },
        { name: 'El Vergel de Luis', email: 'luis@vergel.es', address: 'Calle Huertas 8, Cáceres', lat: 39.476, lon: -6.374 },
    ];

    const producerIds: string[] = [];
    for (const p of producers) {
        const user = await prisma.user.upsert({
            where: { email: p.email },
            update: { address: p.address, latitude: p.lat, longitude: p.lon },
            create: {
                tenantId,
                name: p.name,
                email: p.email,
                password,
                role: Role.producer,
                address: p.address,
                latitude: p.lat,
                longitude: p.lon
            },
        });
        producerIds.push(user.id);
    }

    // 3. Consumers (12)
    const consumerNames = [
        'Aura Galáctica', 'Marcos El Gourmet', 'Selma La Sostenible',
        'Hugo El Cocinillas', 'Elena Eco-Warrior', 'Zoe La Vegana',
        'Bruno Delicatesen', 'Nina Natural', 'Leo Sabores',
        'Alma Raíces', 'Silvio Gourmet', 'Lola Pura Vida'
    ];

    for (let i = 0; i < consumerNames.length; i++) {
        await prisma.user.upsert({
            where: { email: `consumer${i}@huertify.test` },
            update: {},
            create: {
                tenantId,
                name: consumerNames[i],
                email: `consumer${i}@huertify.test`,
                password,
                role: Role.consumer,
                address: `Calle Falsa ${i + 10}, Cáceres`,
                latitude: 39.475 + (Math.random() * 0.01 - 0.005),
                longitude: -6.372 + (Math.random() * 0.01 - 0.005),
            }
        });
    }

    // 4. Logistics Staff
    await prisma.user.upsert({
        where: { email: 'captain@huertify.local' },
        update: {},
        create: {
            tenantId,
            name: 'Capitán Garfio',
            email: 'captain@huertify.local',
            password,
            role: Role.captain,
        }
    });

    await prisma.user.upsert({
        where: { email: 'repartidor@huertify.test' },
        update: {},
        create: {
            tenantId,
            name: 'Rafa Repartidor',
            email: 'repartidor@huertify.test',
            password,
            role: Role.repartidor,
        }
    });

    // 5. Products (20+ categories)
    const productsData = [
        { name: 'Miel de Milflores Silvestres', unitType: UnitType.unit, price: 8.50, desc: 'Cosecha de primavera en la Sierra de Gata.', pIdx: 0 },
        { name: 'Miel de Encina Pura', unitType: UnitType.unit, price: 12.00, desc: 'Oscura, densa y con toques de bosque.', pIdx: 0 },
        { name: 'Tomate Rosa de Aliseda', unitType: UnitType.weight_variable, price: 4.50, desc: 'Gigante, carnoso y con el sabor de antes.', pIdx: 1 },
        { name: 'Calabacín Luna (Redondo)', unitType: UnitType.unit, price: 1.80, desc: 'Perfecto para rellenar, piel tierna.', pIdx: 1 },
        { name: 'Berenjena Blanca Preciosa', unitType: UnitType.weight_variable, price: 3.20, desc: 'Dulzura extrema sin amargor.', pIdx: 2 },
        { name: 'Pimiento de Padrón Peligroso', unitType: UnitType.weight_fixed, price: 2.50, desc: 'Unos pican y otros no.', pIdx: 2 },
        { name: 'Brócoli Fractal (Romanesco)', unitType: UnitType.weight_fixed, price: 3.80, desc: 'Geometría perfecta en tu plato.', pIdx: 3 },
        { name: 'Coliflor Púrpura Real', unitType: UnitType.unit, price: 4.20, desc: 'Mantiene su color tras el vapor.', pIdx: 3 },
        { name: 'Espárrago Triguero de Rivera', unitType: UnitType.bunch, price: 4.50, desc: 'Finos y con un toque amargo delicioso.', pIdx: 4 },
        { name: 'Judía Verde Plana Extra', unitType: UnitType.weight_fixed, price: 3.10, desc: 'Sin hebras, crujiente total.', pIdx: 4 },
        { name: 'Patata Agria de Secano', unitType: UnitType.weight_fixed, price: 1.20, desc: 'La reina de las patatas fritas.', pIdx: 1 },
        { name: 'Batata Dulce de la Huerta', unitType: UnitType.weight_variable, price: 2.40, desc: 'Textura suave, ideal para asar.', pIdx: 2 },
        { name: 'Cebolla Morada de Verano', unitType: UnitType.weight_fixed, price: 1.80, desc: 'Dulce, ideal para ensaladas crudas.', pIdx: 3 },
        { name: 'Ajo Negro Fermentado', unitType: UnitType.unit, price: 6.00, desc: 'Sabor umami, textura de gominola.', pIdx: 0 },
        { name: 'Apio Crujiente de Montaña', unitType: UnitType.unit, price: 1.50, desc: 'Tallos gruesos y llenos de agua.', pIdx: 4 },
        { name: 'Acelga Arcoíris', unitType: UnitType.bunch, price: 2.80, desc: 'Tallos de colores vibrantes.', pIdx: 1 },
        { name: 'Espinaca de Hoja Ancha', unitType: UnitType.bunch, price: 2.20, desc: 'Tiernas y recién cortadas.', pIdx: 2 },
        { name: 'Rúcula Selvática Picante', unitType: UnitType.bunch, price: 1.90, desc: 'Mucho más sabor que la de super.', pIdx: 3 },
        { name: 'Kale Rizado Bio', unitType: UnitType.bunch, price: 2.50, desc: 'Súper alimento del huerto.', pIdx: 4 },
        { name: 'Puerro Fino de Arena', unitType: UnitType.bunch, price: 2.00, desc: 'Sabor delicado para tus cremas.', pIdx: 1 },
        { name: 'Chirivía Dulce', unitType: UnitType.weight_variable, price: 2.30, desc: 'Pura esencia de invierno.', pIdx: 2 },
        { name: 'Rábano Sandía (Red Meat)', unitType: UnitType.bunch, price: 2.60, desc: 'Rosa por dentro, verde por fuera.', pIdx: 3 },
    ];

    for (const p of productsData) {
        // Find existing or create new product
        const product = await prisma.product.create({
            data: {
                tenantId,
                name: p.name,
                unitType: p.unitType,
                pricePerKg: (p.unitType === UnitType.weight_fixed || p.unitType === UnitType.weight_variable) ? p.price : undefined,
                pricePerBunch: p.unitType === UnitType.bunch ? p.price : undefined,
                pricePerUnit: p.unitType === UnitType.unit ? p.price : undefined,
                unitDescription: p.desc,
            },
        });

        // 5. Offers (Weekly Puesto)
        for (const week of [thisMonday, nextMonday]) {
            await prisma.offer.create({
                data: {
                    tenantId,
                    producerId: producerIds[p.pIdx],
                    productId: product.id,
                    week: week,
                    availableQuantityKg: (p.unitType !== UnitType.bunch && p.unitType !== UnitType.unit) ? 20 + Math.random() * 30 : undefined,
                    availableUnits: (p.unitType === UnitType.bunch || p.unitType === UnitType.unit) ? 10 + Math.floor(Math.random() * 20) : undefined,
                    isConfirmed: true,
                },
            });
        }
    }

    console.log('--- Seeding Done: El Puesto está lleno! ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
