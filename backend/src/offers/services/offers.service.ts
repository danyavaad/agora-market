/*
 * File: offers.service.ts
 * Purpose: Lógica de negocio para la gestión de ofertas de productores.
 * Dependencies: PrismaService
 * Domain: Ofertas
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOfferDto } from '../dto/create-offer.dto';

@Injectable()
export class OffersService {
    constructor(private prisma: PrismaService) { }


    /**
     * Crea o actualiza una oferta para un productor, producto y semana específicos.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor.
     * @param createOfferDto DTO con los datos de la oferta.
     * @returns La oferta creada o actualizada.
     */
    async createOrUpdate(tenantId: string, producerId: string, createOfferDto: CreateOfferDto) {
        // Upsert the offer based on Producer + Product + Week
        const { productId, week, availableQuantityKg, availableUnits } = createOfferDto;

        // Validar que el producerId existe y es un productor
        const producer = await this.prisma.user.findUnique({
            where: { id: producerId },
            select: { id: true, role: true }
        });

        if (!producer) {
            throw new NotFoundException(`Productor con ID ${producerId} no encontrado`);
        }

        if (producer.role !== 'producer') {
            throw new NotFoundException(`El usuario ${producerId} no es un productor`);
        }

        return this.prisma.offer.upsert({
            where: {
                producerId_productId_week: {
                    producerId,
                    productId,
                    week: new Date(week),
                },
            },
            update: {
                availableQuantityKg,
                availableUnits,
                photoUrl: createOfferDto.photoUrl,
                // price logic could be added here if we allow per-offer price overrides
            },
            create: {
                tenantId,
                producerId,
                productId,
                week: new Date(week),
                availableQuantityKg,
                availableUnits,
                photoUrl: createOfferDto.photoUrl,
            },
        });
    }


    /**
     * Obtiene todas las ofertas de un productor específico.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor.
     * @returns Lista de ofertas.
     */
    async findAllByProducer(tenantId: string, producerId: string) {
        const offers = await this.prisma.offer.findMany({
            where: { tenantId, producerId },
            include: { product: true },
            orderBy: { week: 'desc' },
        });

        return Promise.all(offers.map(async (offer) => {
            // Find non-cancelled order items for this product/producer/week
            const reservedItems = await this.prisma.orderItem.findMany({
                where: {
                    assignedToProducerId: producerId,
                    productId: offer.productId,
                    order: {
                        tenantId,
                        week: offer.week,
                        status: { not: 'cancelled' }
                    }
                }
            });

            const reservedQuantityKg = reservedItems.reduce((sum, item) => sum + (Number(item.estimatedQuantityKg) || 0), 0);
            const reservedUnits = reservedItems.reduce((sum, item) => sum + (item.estimatedUnits || 0), 0);

            console.log(`[RESERVED] Product: ${offer.product.name}, Reserved: ${reservedUnits} units / ${reservedQuantityKg} kg (${reservedItems.length} orders)`);

            return {
                ...offer,
                reservedQuantityKg,
                reservedUnits
            };
        }));
    }


    /**
     * Obtiene todas las ofertas para una semana específica.
     * @param tenantId ID del tenant.
     * @param week Fecha de la semana.
     * @returns Lista de ofertas.
     */
    async findAllByWeek(tenantId: string, week: Date) {
        return this.prisma.offer.findMany({
            where: { tenantId, week },
            include: { product: true, producer: true },
        });
    }


    /**
     * Valida la cosecha confirmando las ofertas de un productor para una semana.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor.
     * @param week Fecha de la semana.
     * @returns Resultado de la actualización.
     */
    async validateHarvest(tenantId: string, producerId: string, week: string) {
        return this.prisma.offer.updateMany({
            where: {
                tenantId,
                producerId,
                week: new Date(week),
            },
            data: {
                isConfirmed: true,
            },
        });
    }


    /**
     * Elimina una oferta específica.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor (para validación).
     * @param offerId ID de la oferta a eliminar.
     * @returns La oferta eliminada.
     */
    async remove(tenantId: string, producerId: string, offerId: string) {
        const offer = await this.prisma.offer.findUnique({
            where: { id: offerId }
        });

        if (!offer) throw new NotFoundException('Oferta no encontrada');
        if (offer.producerId !== producerId) throw new NotFoundException('No tienes permiso');

        return this.prisma.offer.delete({
            where: { id: offerId }
        });
    }


    /**
     * Obtiene el conteo de ofertas activas para un productor en una semana.
     * @param tenantId ID del tenant.
     * @param producerId ID del productor.
     * @param week Fecha de la semana.
     * @returns Número de ofertas.
     */
    async getActiveOfferCount(tenantId: string, producerId: string, week: string) {
        return this.prisma.offer.count({
            where: {
                tenantId,
                producerId,
                week: new Date(week)
            }
        });
    }
}
