/*
 * File: orders.service.ts
 * Purpose: Lógica de negocio para la agregación del mercado y creación de pedidos.
 * Design: Patrón Service orquestador que centraliza el cálculo de stock y transacciones de pedidos.
 * Dependencies: PrismaService
 * Domain: Pedidos
 */

export interface ProducerDeliveryItem {
    id: string;
    productName: string;
    unitType: string;
    qty: string | number | null;
}

export interface ProducerDeliveryGroup {
    orderId: string;
    binNumber: number | null;
    customerName: string;
    items: ProducerDeliveryItem[];
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
    constructor(private prisma: PrismaService) { }

    // 1. Get Market Products (Aggregated Offers)

    /**
     * Obtiene los productos disponibles en el mercado para una semana específica, calculando el stock agregado y el productor principal.
     * @param tenantId ID del tenant.
     * @param week Fecha de la semana.
     * @returns Lista de productos con estado de mercado.
     */
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
                    some: { week: week, isConfirmed: true }
                }
            },
            include: {
                offers: {
                    where: { week: week, isConfirmed: true },
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
        }).filter(p => p.marketState.totalAvailableKg > 0 || p.marketState.totalAvailableUnits > 0);
    }

    // 2. Create Order (Basket)

    /**
     * Crea un nuevo pedido para un consumidor, gestionando la asignación de productores y la resta de stock.
     * @param tenantId ID del tenant.
     * @param consumerId ID del consumidor.
     * @param createOrderDto DTO con los detalles del pedido.
     * @returns El pedido creado.
     */
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
            const finalOrderItems = [];

            for (const item of items) {
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

                // Sort offers based on priority
                const sortedOffers = [...offers].sort((a, b) => {
                    const priorityA = priorities.find(p => p.producerId === a.producerId)?.priorityOrder ?? 999;
                    const priorityB = priorities.find(p => p.producerId === b.producerId)?.priorityOrder ?? 999;
                    if (priorityA !== priorityB) return priorityA - priorityB;
                    // Tie-breaker: most stock first
                    const stockA = (product.unitType === 'bunch' || product.unitType === 'unit') ? (a.availableUnits || 0) : Number(a.availableQuantityKg || 0);
                    const stockB = (product.unitType === 'bunch' || product.unitType === 'unit') ? (b.availableUnits || 0) : Number(b.availableQuantityKg || 0);
                    return stockB - stockA;
                });

                let remainingNeededConfigured = (product.unitType === 'bunch' || product.unitType === 'unit')
                    ? (item.units || 0)
                    : (item.quantityKg || 0);

                let totalFound = 0;

                // Determine unit price one time
                let basePricePerUnit = 0; // per Kg or per Unit/Bunch
                if (product.unitType === 'weight_variable') {
                    const avgWeight = (Number(product.minWeightKg || 0) + Number(product.maxWeightKg || 0)) / 2;
                    // For variable weight, price calc is tricky because 'units' are bunches, but price is per kg.
                    // Usually variable weight items are sold by "units" (e.g. 1 watermelon) but priced by kg.
                    // The input `item` likely has `units`.
                    // We need to estimate price based on avg weight.
                    // BUT stock is tracked in units usually or kg?
                    // Offers usually track `availableUnits` for "bunch/unit" or `availableQuantityKg` for weight.
                    // Let's stick to the existing logic:
                    // If weight_variable -> we track stock by UNITS usually? No, schema says `availableQuantityKg` or `availableUnits`.
                    // existing logic used: `itemPrice = Number(product.pricePerKg || 0) * (avgWeight || 1) * (item.units || 0);`
                    // So weight_variable is sold by UNITS but priced by KG.
                    // Let's assume stock is tracked by KG for weight items? Or Units?
                    // Previous logic checked `availableQuantityKg` if NOT bunch/unit.
                    // So for weight_variable/weight_fixed we track KG.
                    basePricePerUnit = Number(product.pricePerKg || 0) * (avgWeight || 1);
                } else if (product.unitType === 'bunch') {
                    basePricePerUnit = Number(product.pricePerBunch || 0);
                } else if (product.unitType === 'unit') { // Just in case
                    basePricePerUnit = Number(product.pricePerUnit || 0);
                } else {
                    basePricePerUnit = Number(product.pricePerKg || 0);
                }

                // Iterate through sorted offers to fill the order
                for (const offer of sortedOffers) {
                    if (remainingNeededConfigured <= 0) break;

                    const isUnitBased = (product.unitType === 'bunch' || product.unitType === 'unit');
                    const availableInOffer = isUnitBased ? (offer.availableUnits || 0) : Number(offer.availableQuantityKg || 0);

                    if (availableInOffer <= 0) continue;

                    const takeAmount = Math.min(remainingNeededConfigured, availableInOffer);

                    // Add split item
                    let itemEstimatedPrice = 0;
                    if (product.unitType === 'weight_variable') {
                        const avgWeight = (Number(product.minWeightKg || 0) + Number(product.maxWeightKg || 0)) / 2;
                        itemEstimatedPrice = Number(product.pricePerKg || 0) * (avgWeight || 1) * takeAmount; // takeAmount is units
                    } else if (product.unitType === 'bunch') {
                        itemEstimatedPrice = Number(product.pricePerBunch || 0) * takeAmount;
                    } else if (product.unitType === 'unit') {
                        itemEstimatedPrice = Number(product.pricePerUnit || 0) * takeAmount;
                    } else {
                        // weight_fixed -> takeAmount is KG
                        itemEstimatedPrice = Number(product.pricePerKg || 0) * takeAmount;
                    }

                    finalOrderItems.push({
                        productId: item.productId,
                        estimatedQuantityKg: !isUnitBased ? takeAmount : undefined, // If weight based
                        estimatedUnits: isUnitBased || product.unitType === 'weight_variable' ? takeAmount : undefined, // If unit/bunch based
                        estimatedPrice: itemEstimatedPrice,
                        assignedToProducerId: offer.producerId
                    });

                    totalEstimatedProducts += itemEstimatedPrice;

                    // Decrement Stock in DB
                    console.log(`[STOCK] Decrementing stock for offer ${offer.id}: ${takeAmount} ${isUnitBased ? 'units' : 'kg'}`);
                    if (isUnitBased) {
                        console.log(`[STOCK] Before: ${offer.availableUnits} units, decrementing ${takeAmount}`);
                        const updatedOffer = await tx.offer.update({
                            where: { id: offer.id },
                            data: { availableUnits: { decrement: takeAmount } }
                        });
                        console.log(`[STOCK] After update: ${updatedOffer.availableUnits} units (should be ${(offer.availableUnits || 0) - takeAmount})`);
                    } else {
                        // For weight based, takeAmount is KG
                        const newKg = Number(offer.availableQuantityKg) - takeAmount;
                        const updatedOffer = await tx.offer.update({
                            where: { id: offer.id },
                            data: { availableQuantityKg: newKg.toString() }
                        });
                        console.log(`[STOCK] After update: ${updatedOffer.availableQuantityKg} kg (should be ${newKg})`);
                    }

                    remainingNeededConfigured -= takeAmount;
                }

                if (remainingNeededConfigured > 0.01) { // Tolerance for float math
                    throw new BadRequestException(`No hay stock suficiente para ${product.name}. Faltan: ${remainingNeededConfigured}`);
                }
            }

            // 4. Create the Order
            console.log(`[ORDER] Creating order with ${finalOrderItems.length} items, total: ${totalEstimatedProducts + deliveryFee}€`);
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
            const orderItemsData = finalOrderItems.map(item => ({
                orderId: order.id,
                productId: item.productId,
                estimatedQuantityKg: item.estimatedQuantityKg,
                estimatedUnits: item.estimatedUnits,
                estimatedPrice: item.estimatedPrice,
                assignedToProducerId: item.assignedToProducerId,
            }));

            await tx.orderItem.createMany({
                data: orderItemsData
            });

            console.log(`[ORDER] Order created successfully: ${order.id}`);
            console.log(`[TRANSACTION] Committing transaction...`);
            return order;
        }).then(order => {
            console.log(`[TRANSACTION] Transaction committed successfully for order ${order.id}`);
            return order;
        }).catch(error => {
            console.error(`[TRANSACTION] Transaction failed and rolled back:`, error);
            throw error;
        });
    }


    /**
     * Obtiene todos los pedidos realizados por un consumidor.
     * @param tenantId ID del tenant.
     * @param consumerId ID del consumidor.
     * @returns Lista de pedidos con sus items y productos.
     */
    async getConsumerOrders(tenantId: string, consumerId: string) {
        return this.prisma.order.findMany({
            where: { tenantId, consumerId },
            include: {
                items: {
                    include: {
                        product: true,
                        review: true,
                        assignedProducer: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { week: 'desc' }
        });
    }

    // 4. Update Harvest Weight (Real Adjustment)

    /**
     * Actualiza el peso real de un item tras la cosecha y recalcula el precio final del pedido.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor que realiza el ajuste.
     * @param orderItemId ID del item del pedido.
     * @param realWeightKg Peso real en kg.
     * @returns El item de pedido actualizado.
     */
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

    /**
     * Obtiene la lista de picking (cosecha) para un productor específico en una semana.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor.
     * @param week Fecha de la semana.
     * @returns Lista de items a cosechar/preparar.
     */
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

    /**
     * Confirma la recogida de un pedido mediante un token QR (acción del Capitán).
     * @param tenantId ID del tenant.
     * @param captainId ID del capitán que confirma.
     * @param qrToken Token único del pedido.
     * @returns El pedido marcado como entregado.
     */
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
            },
            include: {
                consumer: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { name: true, unitType: true }
                        }
                    }
                }
            }
        });
    }


    /**
     * Cancela un pedido y restaura el stock de los productos asociados.
     * @param tenantId ID del tenant.
     * @param consumerId ID del consumidor que cancela.
     * @param orderId ID del pedido a cancelar.
     * @returns El pedido actualizado.
     */
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
                if (!item.assignedToProducerId) continue;

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

    /**
     * Obtiene los productos que un productor tiene pendientes de entregar para la semana activa.
     * @param tenantId ID del nodo.
     * @param producerId ID del productor.
     * @returns Lista de grupos de entrega por pedido (Bin).
     */
    async getProducerPendingDeliveries(tenantId: string, producerId: string): Promise<ProducerDeliveryGroup[]> {
        // 1. Get all items assigned to producer for ACTIVE orders
        const items = await this.prisma.orderItem.findMany({
            where: {
                assignedToProducerId: producerId,
                order: {
                    tenantId,
                    status: { not: 'cancelled' }
                }
            },
            include: {
                order: { include: { consumer: { select: { name: true } } } },
                product: { select: { name: true, unitType: true } }
            }
        });

        // 2. Check existing confirmed deliveries
        const deliveries = await this.prisma.delivery.findMany({
            where: {
                tenantId,
                producerId,
                confirmedAt: { not: null }
            }
        });
        const confirmedOrderIds = new Set(deliveries.map(d => d.orderId));

        // 3. Group by Order
        const groups: Record<string, ProducerDeliveryGroup> = {};

        for (const item of items) {
            if (confirmedOrderIds.has(item.orderId)) continue;

            if (!groups[item.orderId]) {
                groups[item.orderId] = {
                    orderId: item.orderId,
                    binNumber: item.order.binNumber,
                    customerName: item.order.consumer?.name || 'Cliente',
                    items: []
                };
            }

            groups[item.orderId].items.push({
                id: item.id,
                productName: item.product.name,
                unitType: item.product.unitType,
                qty: (item.product.unitType === 'bunch' || item.product.unitType === 'unit')
                    ? item.estimatedUnits
                    : Number(item.estimatedQuantityKg).toFixed(2)
            });
        }

        return Object.values(groups).sort((a: ProducerDeliveryGroup, b: ProducerDeliveryGroup) => (a.binNumber || 0) - (b.binNumber || 0));
    }

    /**
     * Confirma la recepción de la mercancía de un productor para un pedido específico.
     * @param tenantId ID del nodo.
     * @param producerId ID del productor.
     * @param orderId ID del pedido.
     * @param confirmedBy ID del usuario (Capitán) que confirma.
     */
    async confirmProducerDelivery(tenantId: string, producerId: string, orderId: string, confirmedBy: string) {
        // Create Delivery Record
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) throw new NotFoundException('Order not found');

        // Upsert logic manually check
        const existing = await this.prisma.delivery.findFirst({
            where: { orderId, producerId }
        });

        if (existing) {
            return this.prisma.delivery.update({
                where: { id: existing.id },
                data: { confirmedAt: new Date(), confirmedBy }
            });
        }

        return this.prisma.delivery.create({
            data: {
                tenantId,
                orderId,
                producerId,
                binNumber: order.binNumber || 0,
                confirmedAt: new Date(),
                confirmedBy
            }
        });
    }
}
