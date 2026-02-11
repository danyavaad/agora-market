/*
 * File: delivery.service.ts
 * Purpose: Lógica de logística, rutas de reparto y pooling geográfico.
 * Dependencies: PrismaService
 * Domain: Logística
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private prisma: PrismaService) { }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371e3; // Earth radius in meters
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // distance in meters
    }

    async getRouteSheet(tenantId: string, week: string) {
        const targetDate = new Date(week);
        const orders = (await this.prisma.order.findMany({
            where: {
                tenantId,
                week: targetDate,
                status: 'confirmed'
            },
            include: {
                consumer: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        latitude: true,
                        longitude: true
                    }
                },
                items: {
                    include: { product: true }
                }
            }
        })) as any[];

        // Simple Clustering Logic for Pooling
        const POOLING_RADIUS_METERS = 500;
        const routes = [];
        const visited = new Set();

        for (const order of orders) {
            if (visited.has(order.id)) continue;

            const pool = [order];
            visited.add(order.id);

            // Find neighbors for this pool
            if (order.consumer.latitude && order.consumer.longitude) {
                for (const potential of orders) {
                    if (visited.has(potential.id)) continue;
                    if (!potential.consumer.latitude || !potential.consumer.longitude) continue;

                    const dist = this.calculateDistance(
                        order.consumer.latitude, order.consumer.longitude,
                        potential.consumer.latitude, potential.consumer.longitude
                    );

                    if (dist <= POOLING_RADIUS_METERS) {
                        pool.push(potential);
                        visited.add(potential.id);
                    }
                }
            }

            routes.push({
                isPool: pool.length > 1,
                orders: pool,
                mainAddress: pool[0].consumer.address || 'Sin dirección',
                totalWeight: pool.reduce((acc, o) => acc + Number(o.totalEstimated || 0), 0) // Simplified
            });
        }

        return routes;
    }

    async confirmDelivery(tenantId: string, orderId: string) {
        return this.prisma.order.update({
            where: { id: orderId, tenantId },
            data: { status: 'delivered' }
        });
    }
}
