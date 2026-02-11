/*
 * File: prisma.service.ts
 * Purpose: Cliente de base de datos Prisma para manejo de la persistencia de datos.
 * Dependencies: PrismaClient
 * Domain: Data Access
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({ log: ['warn', 'error'] });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
