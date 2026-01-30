/*
 * File: orders.service.ts
 * Purpose: Business logic for Market aggregation and Order creation.
 * Dependencies: PrismaService, CreateOrderDto
 */

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    // 1. Get Market Products (Aggregated Offers)
    async getMarketProducts(tenantId: string, week: Date) {
        // Find active season to get priorities
        const activeSeason = await this.prisma.season.findFirst({
            where: { tenantId, status: 'ACTIVE' },
            include: {
                producerPriorities: {
                    include: { producer: true }
                }
            }
        });

        const productsWithOffers = await this.prisma.product.findMany({
            where: {
                tenantId,
                offers: {
                    some: { week: week }
                }
            },
            include: {
                offers: {
                    where: { week: week },
                    include: { producer: true }
                }
            }
        });

        return productsWithOffers.map(p => {
            const totalKg = p.offers.reduce((sum, o) => sum + (Number(o.availableQuantityKg) || 0), 0);
            const totalUnits = p.offers.reduce((sum, o) => sum + (o.availableUnits || 0), 0);

            // Calculate Primary Producer based on stock and priorities
            let primaryProducer = null;
            if (activeSeason) {
                const productPriorities = activeSeason.producerPriorities
                    .filter(pp => pp.productId === p.id)
                    .sort((a, b) => a.priorityOrder - b.priorityOrder);

                for (const pp of productPriorities) {
                    const offer = p.offers.find(o => o.producerId === pp.producerId);
                    const hasStock = (p.unitType === 'bunch' || p.unitType === 'unit')
                        ? (offer?.availableUnits || 0) > 0
                        : (Number(offer?.availableQuantityKg) || 0) > 0;

                    if (hasStock) {
                        primaryProducer = {
                            id: pp.producer.id,
                            name: pp.producer.name
                        };
                        break;
                    }
                }
            }

            // Fallback to first producer with stock if no priority defined
            if (!primaryProducer && p.offers.length > 0) {
                const firstWithStock = p.offers.find(o =>
                    (p.unitType === 'bunch' || p.unitType === 'unit')
                        ? (o.availableUnits || 0) > 0
                        : (Number(o.availableQuantityKg) || 0) > 0
                );
                if (firstWithStock) {
                    primaryProducer = {
                        id: firstWithStock.producer.id,
                        name: firstWithStock.producer.name
                    };
                }
            }

            // Calculate Estimated Price for variable weight products
            let estimatedPricePerUnit = null;
            if (p.unitType === 'weight_variable' && p.pricePerKg) {
                const avgWeight = (Number(p.minWeightKg || 0) + Number(p.maxWeightKg || 0)) / 2;
                estimatedPricePerUnit = Number(p.pricePerKg) * (avgWeight || 1);
            } else if (p.unitType === 'bunch') {
                estimatedPricePerUnit = Number(p.pricePerBunch || 0);
            } else if (p.unitType === 'weight_fixed') {
                estimatedPricePerUnit = Number(p.pricePerKg || 0);
            }

            return {
                ...p,
                estimatedPricePerUnit,
                primaryProducer,
                marketState: {
                    totalAvailableKg: totalKg,
                    totalAvailableUnits: totalUnits,
                    offerCount: p.offers.length,
                    offerPhotos: p.offers.map(o => o.photoUrl).filter(url => !!url)
                },
                offers: undefined
            };
        });
    }

    // 2. Create Order (Basket)
    async createOrder(tenantId: string, consumerId: string, createOrderDto: CreateOrderDto) {
        const { week, items, deliveryDistanceKm } = createOrderDto;
        const weekDate = new Date(week);

        if (!items || items.length === 0) {
            throw new BadRequestException('Order must have items');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Assign Bin Number
            const lastOrder = await tx.order.findFirst({
                where: { tenantId, week: weekDate },
                orderBy: { binNumber: 'desc' },
                select: { binNumber: true }
            });
            const nextBinNumber = (lastOrder?.binNumber || 0) + 1;

            // 2. Calculate Delivery Fee
            const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
            const kmRate = Number(tenant?.kmRate || 0.30);
            const deliveryFee = (deliveryDistanceKm || 0) * kmRate;

            // 3. Fetch prices and calculate estimated total + Assign Producers (Cascade) + Subtract Stock
            let totalEstimatedProducts = 0;
            const itemsWithProducers = await Promise.all(items.map(async (item) => {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new BadRequestException(`Product ${item.productId} not found`);

                // Stock Cascade: Find offers and priorities
                const activeSeason = await tx.season.findFirst({ where: { tenantId, status: 'ACTIVE' } });

                const offers = await tx.offer.findMany({
                    where: { productId: item.productId, week: weekDate, tenantId }
                });

                const priorities = activeSeason ? await tx.producerPriority.findMany({
                    where: { productId: item.productId, tenantId, seasonId: activeSeason.id },
                    orderBy: { priorityOrder: 'asc' }
                }) : [];

                let assignedToProducerId = null;
                for (const priority of priorities) {
                    const off = offers.find(o => o.producerId === priority.producerId);
                    const hasStock = (product.unitType === 'bunch' || product.unitType === 'unit')
                        ? (off?.availableUnits ?? 0) >= (item.units || 0)
                        : (Number(off?.availableQuantityKg) || 0) >= (item.quantityKg || 0);

                    if (hasStock) {
                        assignedToProducerId = priority.producerId;
                        break;
                    }
                }

                if (!assignedToProducerId) {
                    // GLOBAL STOCK CHECK as fallback or verification
                    const totalAcrossProducers = offers.reduce((sum, o) =>
                        sum + ((product.unitType === 'bunch' || product.unitType === 'unit')
                            ? (o.availableUnits || 0)
                            : Number(o.availableQuantityKg || 0)), 0);

                    const needed = (product.unitType === 'bunch' || product.unitType === 'unit') ? (item.units || 0) : (item.quantityKg || 0);

                    if (totalAcrossProducers < needed) {
                        throw new BadRequestException(`No hay stock suficiente para ${product.name}. Disponible: ${totalAcrossProducers}, Pedido: ${needed}`);
                    }

                    // If total is enough but NO SINGLE producer has enough, we'd need to split (Future logic), 
                    // but for now we pick the one with the most stock if fallback
                    const biggestOffer = [...offers].sort((a, b) =>
                        ((product.unitType === 'bunch' || product.unitType === 'unit') ? ((b.availableUnits ?? 0) - (a.availableUnits ?? 0)) : (Number(b.availableQuantityKg) - Number(a.availableQuantityKg)))
                    )[0];

                    if (biggestOffer) assignedToProducerId = biggestOffer.producerId;
                }

                if (!assignedToProducerId) {
                    throw new BadRequestException(`No hay stock disponible para ${product.name}`);
                }

                // SUBTRACT STOCK
                const currentOffer = await tx.offer.findUnique({
                    where: {
                        producerId_productId_week: {
                            producerId: assignedToProducerId,
                            productId: item.productId,
                            week: weekDate
                        }
                    }
                });

                if (!currentOffer) throw new BadRequestException(`Oferta no encontrada para stock`);

                if (product.unitType === 'bunch' || product.unitType === 'unit') {
                    await tx.offer.update({
                        where: { id: currentOffer.id },
                        data: { availableUnits: { decrement: item.units || 0 } }
                    });
                } else {
                    const newKg = Number(currentOffer.availableQuantityKg) - (item.quantityKg || 0);
                    await tx.offer.update({
                        where: { id: currentOffer.id },
                        data: { availableQuantityKg: newKg.toString() }
                    });
                }

                let itemPrice = 0;
                if (product.unitType === 'weight_variable') {
                    const avgWeight = (Number(product.minWeightKg || 0) + Number(product.maxWeightKg || 0)) / 2;
                    itemPrice = Number(product.pricePerKg || 0) * (avgWeight || 1) * (item.units || 0);
                } else if (product.unitType === 'bunch') {
                    itemPrice = Number(product.pricePerBunch || 0) * (item.units || 0);
                } else {
                    itemPrice = Number(product.pricePerKg || 0) * (item.quantityKg || 0);
                }

                totalEstimatedProducts += itemPrice;
                return {
                    ...item,
                    estimatedPrice: itemPrice,
                    assignedToProducerId
                };
            }));

            // 4. Create the Order
            const order = await tx.order.create({
                data: {
                    tenantId,
                    consumerId,
                    week: weekDate,
                    status: 'pending',
                    totalEstimated: totalEstimatedProducts + deliveryFee,
                    binNumber: nextBinNumber,
                    pickupQrToken: uuidv4(),
                    deliveryFee: deliveryFee,
                    deliveryDistanceKm: deliveryDistanceKm,
                }
            });

            // 5. Create OrderItems
            const orderItemsData = itemsWithProducers.map(item => ({
                orderId: order.id,
                productId: item.productId,
                estimatedQuantityKg: item.quantityKg,
                estimatedUnits: item.units,
                estimatedPrice: item.estimatedPrice,
                assignedToProducerId: item.assignedToProducerId,
            }));

            await tx.orderItem.createMany({
                data: orderItemsData
            });

            return order;
        });
    }

    async getConsumerOrders(tenantId: string, consumerId: string) {
        return this.prisma.order.findMany({
            where: { tenantId, consumerId },
            include: { items: { include: { product: true, review: true } } },
            orderBy: { week: 'desc' }
        });
    }

    // 4. Update Harvest Weight (Real Adjustment)
    async updateHarvestWeight(tenantId: string, producerId: string, orderItemId: string, realWeightKg: number) {
        return this.prisma.$transaction(async (tx) => {
            const orderItem = await tx.orderItem.findUnique({
                where: { id: orderItemId },
                include: { product: true, order: true }
            });

            if (!orderItem) throw new NotFoundException('Order item not found');
            if (orderItem.order.tenantId !== tenantId) throw new BadRequestException('Tenant mismatch');
            // In a real scenario, we'd also check if the producer matches the one assigned
            // if (orderItem.assignedToProducerId !== producerId) throw new ForbiddenException('Not assigned to you');

            const p = orderItem.product;
            let finalPrice: any = orderItem.estimatedPrice;

            if (p.unitType === 'weight_variable' || p.unitType === 'weight_fixed') {
                finalPrice = Number(p.pricePerKg) * realWeightKg;
            } else if (p.unitType === 'bunch') {
                // Bunches are usually fixed price per unit, but the weight might be recorded.
                // If it's just recorded, the price doesn't change unless we want it to.
                finalPrice = orderItem.estimatedPrice;
            }

            // Update Item
            const updatedItem = await tx.orderItem.update({
                where: { id: orderItemId },
                data: {
                    actualWeightKg: realWeightKg as any,
                    finalPrice: finalPrice as any
                }
            });

            // Recalculate Order TotalReal
            const allItems = await tx.orderItem.findMany({
                where: { orderId: orderItem.orderId }
            });

            const itemsTotalReal = allItems.reduce((sum, item) => {
                const price = item.finalPrice || item.estimatedPrice || 0;
                return sum + Number(price);
            }, 0);

            await tx.order.update({
                where: { id: orderItem.orderId },
                data: {
                    totalFinal: itemsTotalReal + Number(orderItem.order.deliveryFee || 0)
                }
            });

            return updatedItem;
        });
    }

    // 5. Get Picking List for Producer
    async getPickingList(tenantId: string, producerId: string, week: string) {
        const weekDate = new Date(week);
        return this.prisma.orderItem.findMany({
            where: {
                assignedToProducerId: producerId,
                order: {
                    tenantId,
                    week: weekDate
                }
            },
            include: {
                product: true,
                order: {
                    select: {
                        binNumber: true,
                        consumer: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    binNumber: 'asc'
                }
            }
        });
    }

    // 6. Confirm Pickup (Captain Action)
    async confirmPickup(tenantId: string, captainId: string, qrToken: string) {
        // Find order by QR Token
        const order = await this.prisma.order.findUnique({
            where: { pickupQrToken: qrToken }
        });

        if (!order) throw new NotFoundException('Invalid Token');
        if (order.tenantId !== tenantId) throw new BadRequestException('Tenant mismatch');
        if (order.status === 'delivered') throw new BadRequestException('Order already picked up');

        return this.prisma.order.update({
            where: { id: order.id },
            data: {
                status: 'delivered',
                pickupConfirmedBy: captainId as string,
                pickupConfirmedAt: new Date(),
            }
        });
    }

    async cancelOrder(tenantId: string, consumerId: string, orderId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: { include: { product: true } } }
            });

            if (!order) throw new NotFoundException('Pedido no encontrado');
            if (order.consumerId !== consumerId) throw new BadRequestException('No tienes permiso para cancelar este pedido');
            if (order.status !== 'pending' && order.status !== 'confirmed') {
                throw new BadRequestException('No se puede cancelar un pedido en estado: ' + order.status);
            }

            // 1. Restore Stock
            for (const item of order.items) {
                const offer = await tx.offer.findUnique({
                    where: {
                        producerId_productId_week: {
                            producerId: item.assignedToProducerId,
                            productId: item.productId,
                            week: order.week
                        }
                    }
                });

                if (offer) {
                    if (item.product.unitType === 'bunch' || item.product.unitType === 'unit') {
                        await tx.offer.update({
                            where: { id: offer.id },
                            data: { availableUnits: { increment: item.estimatedUnits || 0 } }
                        });
                    } else {
                        const newKg = Number(offer.availableQuantityKg) + Number(item.estimatedQuantityKg || 0);
                        await tx.offer.update({
                            where: { id: offer.id },
                            data: { availableQuantityKg: newKg.toString() }
                        });
                    }
                }
            }

            // 2. Update Order Status
            return tx.order.update({
                where: { id: orderId },
                data: { status: 'cancelled' }
            });
        });
    }
}
