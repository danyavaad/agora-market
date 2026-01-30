import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string): Promise<Tenant | null> {
        return this.prisma.tenant.findUnique({
            where: { id },
        });
    }

    async findAll(): Promise<Tenant[]> {
        return this.prisma.tenant.findMany({
            orderBy: { name: 'asc' }
        });
    }
}
