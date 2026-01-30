/*
 * File: offers.service.ts
 * Purpose: Business logic for managing Producer Offers.
 * Dependencies: PrismaService, CreateOfferDto
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOfferDto } from '../dto/create-offer.dto';

@Injectable()
export class OffersService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdate(tenantId: string, producerId: string, createOfferDto: CreateOfferDto) {
        // Upsert the offer based on Producer + Product + Week
        const { productId, week, availableQuantityKg, availableUnits } = createOfferDto;

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

    async findAllByProducer(tenantId: string, producerId: string) {
        return this.prisma.offer.findMany({
            where: { tenantId, producerId },
            include: { product: true },
            orderBy: { week: 'desc' },
        });
    }

    async findAllByWeek(tenantId: string, week: Date) {
        return this.prisma.offer.findMany({
            where: { tenantId, week },
            include: { product: true, producer: true },
        });
    }

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
