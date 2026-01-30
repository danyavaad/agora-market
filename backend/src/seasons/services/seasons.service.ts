/*
 * File: seasons.service.ts
 * Purpose: Business logic for managing Seasons and Producer Rotations.
 * Dependencies: PrismaService, CreateSeasonDto, UpdateRotationDto
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { UpdateRotationDto } from '../dto/update-rotation.dto';
import { SeasonStatus, Prisma } from '@prisma/client';

@Injectable()
export class SeasonsService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createSeasonDto: CreateSeasonDto) {
        // 1. Get the previous season to determine rotation
        const previousSeason = await this.prisma.season.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });

        let producerRotation: string[] = [];

        if (previousSeason && previousSeason.producerRotation) {
            // Rotation Logic: Shift the array
            // Start: [A, B, C] -> New: [B, C, A] (Example rotation)
            // Requirement: "The list rotates each time...".
            // Assuming "First becomes Last" or similar.
            // "le toque ser el primero en elegir" -> Sequential.
            // If order was [A, B, C], A chose first.
            // Next time, B chooses first? -> [B, C, A]
            const prevRotation = previousSeason.producerRotation as string[];
            if (prevRotation.length > 0) {
                const [first, ...rest] = prevRotation;
                producerRotation = [...rest, first];
            }
        } else {
            // If no previous season, get all producers from tenant and create initial order
            // Assuming producers are users with role 'producer'
            const producers = await this.prisma.user.findMany({
                where: { tenantId, role: 'producer', isActive: true },
                orderBy: { name: 'asc' }, // Initial alphabetical order or by creation
            });
            producerRotation = producers.map(p => p.id);
        }

        // Check for NEW producers that were not in the previous rotation
        // "Si entra un productor nuevo, se coloca al final de la cola"
        const allProducers = await this.prisma.user.findMany({
            where: { tenantId, role: 'producer', isActive: true },
        });

        // Create a Set for quick lookup
        const currentRotationSet = new Set(producerRotation);

        // Add missing producers to the END
        for (const p of allProducers) {
            if (!currentRotationSet.has(p.id)) {
                producerRotation.push(p.id);
            }
        }

        // Also, we might want to remove producers who are no longer active?
        // Leaving them for now or filtering? Better filter to avoid ghosts.
        const activeProducerIds = new Set(allProducers.map(p => p.id));
        producerRotation = producerRotation.filter(id => activeProducerIds.has(id));


        return this.prisma.season.create({
            data: {
                tenantId,
                name: createSeasonDto.name,
                startDate: new Date(createSeasonDto.startDate),
                endDate: createSeasonDto.endDate ? new Date(createSeasonDto.endDate) : null,
                isActive: createSeasonDto.isActive ?? false,
                status: createSeasonDto.isActive ? SeasonStatus.ACTIVE : SeasonStatus.DRAFT,
                producerRotation: producerRotation as Prisma.JsonArray,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.season.findMany({
            where: { tenantId },
            orderBy: { startDate: 'desc' },
        });
    }

    async findOne(id: string) {
        const season = await this.prisma.season.findUnique({
            where: { id },
        });
        if (!season) throw new NotFoundException(`Season with ID ${id} not found`);
        return season;
    }

    async updateRotation(id: string, updateRotationDto: UpdateRotationDto) {
        return this.prisma.season.update({
            where: { id },
            data: {
                producerRotation: updateRotationDto.producerRotation as Prisma.JsonArray,
            },
        });
    }

    async delete(id: string) {
        return this.prisma.season.delete({ where: { id } });
    }

    async setProducerPriority(
        seasonId: string,
        producerId: string,
        productId: string,
        priorityOrder: number,
        tenantId: string,
    ) {
        // Verify season exists and belongs to tenant
        const season = await this.prisma.season.findUnique({
            where: { id: seasonId },
        });
        if (!season || season.tenantId !== tenantId) {
            throw new NotFoundException('Season not found');
        }

        // Upsert the priority
        // "priorityOrder" is the rank (1st choice, 2nd choice).
        return this.prisma.producerPriority.upsert({
            where: {
                seasonId_producerId_priorityOrder: {
                    seasonId,
                    producerId,
                    priorityOrder,
                },
            },
            update: {
                productId,
            },
            create: {
                tenantId,
                seasonId,
                producerId,
                productId,
                priorityOrder,
            },
        });
    }

    async getProducerPriorities(seasonId: string, producerId: string) {
        return this.prisma.producerPriority.findMany({
            where: { seasonId, producerId },
            orderBy: { priorityOrder: 'asc' },
            include: { product: true },
        });
    }

    async getAllPrioritiesForSeason(seasonId: string) {
        return this.prisma.producerPriority.findMany({
            where: { seasonId },
            include: { producer: true, product: true },
            orderBy: [{ priorityOrder: 'asc' }, { producerId: 'asc' }]
        });
    }

    async resolveConflicts(seasonId: string, tenantId: string) {
        // 1. Fetch Season and Rotation
        const season = await this.prisma.season.findUnique({
            where: { id: seasonId },
        });
        if (!season || season.tenantId !== tenantId) {
            throw new NotFoundException('Season not found');
        }

        const rotation = season.producerRotation as string[] || [];
        if (rotation.length === 0) {
            throw new Error('No producer rotation defined for this season.');
        }

        // 2. Fetch all priorities
        const allPriorities = await this.prisma.producerPriority.findMany({
            where: { seasonId },
            orderBy: { priorityOrder: 'asc' }, // Get 1st choices, then 2nd...
        });

        // Group priorities by producer for easy access
        // Map<producerId, Map<priorityOrder, productId>>
        const prioritiesMap = new Map<string, Map<number, string>>();
        for (const p of allPriorities) {
            if (!prioritiesMap.has(p.producerId)) {
                prioritiesMap.set(p.producerId, new Map());
            }
            prioritiesMap.get(p.producerId)!.set(p.priorityOrder, p.productId);
        }

        // 3. Allocation Logic (The Draft)
        const allocations: { producerId: string; productId: string }[] = [];
        const takenProducts = new Set<string>();

        // Determine max priority depth (e.g., did anyone vote up to 5th choice?)
        const maxPriority = allPriorities.length > 0
            ? Math.max(...allPriorities.map(p => p.priorityOrder))
            : 0;

        // Iterate by Round (Priority Level)
        for (let round = 1; round <= maxPriority; round++) {
            // Iterate by Producer Rotation Order
            for (const producerId of rotation) {
                // Check if this producer already has an allocation in this season? 
                // Assumption: In the "Draft", one producer gets ONE product total? 
                // OR one product per round? 
                // User said: "It works like a Draft... This ensures the person at the top always gets their first choice...".
                // Usually crop planning means you get ONE main crop per season?
                // I will assume ONE product per producer for now.

                const hasAllocation = allocations.find(a => a.producerId === producerId);
                if (hasAllocation) continue; // They already got something this season

                const producerPriorities = prioritiesMap.get(producerId);
                if (!producerPriorities) continue; // No priorities set by this producer

                const desiredProduct = producerPriorities.get(round);
                if (desiredProduct && !takenProducts.has(desiredProduct)) {
                    // Assign!
                    allocations.push({ producerId, productId: desiredProduct });
                    takenProducts.add(desiredProduct);
                }
            }
        }

        // 4. Save Allocations (Transaction: Wipe old, save new)
        return this.prisma.$transaction(async (tx) => {
            // Wipe existing allocations for this season
            await tx.seasonAllocation.deleteMany({
                where: { seasonId },
            });

            // Create new
            if (allocations.length > 0) {
                await tx.seasonAllocation.createMany({
                    data: allocations.map(a => ({
                        tenantId,
                        seasonId,
                        producerId: a.producerId,
                        productId: a.productId
                    })),
                });
            }

            return allocations;
        });
    }

    async getAllocations(seasonId: string) {
        return this.prisma.seasonAllocation.findMany({
            where: { seasonId },
            include: { producer: true, product: true },
            orderBy: { producer: { name: 'asc' } }
        });
    }
}
