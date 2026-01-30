/*
 * File: products.service.ts
 * Purpose: Manage product catalogue.
 * Domain: Products
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId }
        });
    }

    async findOne(tenantId: string, id: string) {
        return this.prisma.product.findFirst({
            where: { id, tenantId }
        });
    }
}
