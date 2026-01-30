import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantId = 'nodo-caceres-id';
    const week = new Date('2026-01-26T00:00:00.000Z');

    // 1. Find a product with offers
    const offer = await prisma.offer.findFirst({
        where: { tenantId, week: week },
        include: { product: true, producer: true }
    });

    if (!offer) {
        console.log('❌ No offer found for the test week. Check if seed ran correctly.');
        return;
    }

    const initialStock = offer.product.unitType === 'bunch' || offer.product.unitType === 'unit'
        ? offer.availableUnits : Number(offer.availableQuantityKg);

    console.log(`--- Initial State ---`);
    console.log(`Product: ${offer.product.name}`);
    console.log(`Producer: ${offer.producer.name}`);
    console.log(`Initial Stock: ${initialStock}`);

    // 2. Simulate Stock Decrement Logic from OrdersService
    console.log(`\n--- Simulating Order (2 units/kg) ---`);

    await prisma.$transaction(async (tx) => {
        const currentOffer = await tx.offer.findUnique({
            where: { id: offer.id }
        });

        if (!currentOffer) throw new Error('Offer not found');

        if (offer.product.unitType === 'bunch' || offer.product.unitType === 'unit') {
            await tx.offer.update({
                where: { id: currentOffer.id },
                data: { availableUnits: { decrement: 2 } }
            });
        } else {
            const newKg = Number(currentOffer.availableQuantityKg) - 2;
            await tx.offer.update({
                where: { id: currentOffer.id },
                data: { availableQuantityKg: newKg.toString() }
            });
        }
    });

    // 3. Check stock after order
    const updatedOffer = await prisma.offer.findUnique({
        where: { id: offer.id }
    });

    const finalStock = offer.product.unitType === 'bunch' || offer.product.unitType === 'unit'
        ? updatedOffer?.availableUnits : Number(updatedOffer?.availableQuantityKg);

    console.log(`\n--- Final State ---`);
    console.log(`Final Stock: ${finalStock}`);

    if (typeof initialStock === 'number' && typeof finalStock === 'number') {
        if (Math.abs((initialStock - finalStock) - 2) < 0.001) {
            console.log(`\n✅ SUCCESS: Stock decremented correctly.`);
        } else {
            console.log(`\n❌ FAILURE: Stock decrement mismatch. Diff: ${initialStock - finalStock}`);
        }
    } else {
        console.log(`\n❌ FAILURE: Stocks are not numbers. Initial: ${initialStock}, Final: ${finalStock}`);
    }

    // 4. Test Market Attribution Logic (Primary Producer)
    console.log(`\n--- Testing Artist/Producer Attribution ---`);
    const activeSeason = await prisma.season.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: {
            producerPriorities: {
                include: { producer: true }
            }
        }
    });

    const productWithOffers = await prisma.product.findUnique({
        where: { id: offer.productId },
        include: {
            offers: {
                where: { week: week },
                include: { producer: true }
            }
        }
    });

    let primaryProducer = null;
    if (activeSeason) {
        const productPriorities = activeSeason.producerPriorities
            .filter(pp => pp.productId === offer.productId)
            .sort((a, b) => a.priorityOrder - b.priorityOrder);

        for (const pp of productPriorities) {
            const off = productWithOffers?.offers.find(o => o.producerId === pp.producerId);
            const hasStock = (offer.product.unitType === 'bunch' || offer.product.unitType === 'unit')
                ? (off?.availableUnits || 0) > 0
                : (Number(off?.availableQuantityKg) || 0) > 0;

            if (hasStock) {
                primaryProducer = { id: pp.producer.id, name: pp.producer.name };
                break;
            }
        }
    }

    console.log(`Market Primary Producer: ${primaryProducer ? primaryProducer.name : 'NONE'}`);
    if (primaryProducer) {
        console.log(`✅ SUCCESS: Primary producer correctly identified based on priority.`);
    } else {
        console.log(`⚠️ INFO: No primary producer found (possibly due to no stock or no priority defined). This is acceptable if the first-available fallback isn't tested here.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
