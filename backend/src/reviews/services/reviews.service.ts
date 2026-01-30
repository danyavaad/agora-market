import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) { }

    async createReview(tenantId: string, consumerId: string, data: any) {
        return this.prisma.review.create({
            data: {
                tenantId,
                consumerId,
                productId: data.productId,
                producerId: data.producerId,
                orderItemId: data.orderItemId,
                rating: data.rating,
                comment: data.comment,
            }
        });
    }

    async getProductReviews(tenantId: string, productId: string) {
        return this.prisma.review.findMany({
            where: { tenantId, productId },
            include: {
                consumer: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getProducerReviews(tenantId: string, producerId: string) {
        return this.prisma.review.findMany({
            where: { tenantId, producerId },
            include: {
                consumer: { select: { name: true } },
                product: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
