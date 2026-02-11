/*
 * File: tenants.service.ts
 * Purpose: Servicio para la gestión de persistencia de tenants.
 * Dependencies: PrismaService
 * Domain: Administración
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
    constructor(private prisma: PrismaService) { }


    /**
     * Busca un tenant específico por su ID.
     * @param id ID del tenant.
     * @returns El tenant encontrado o null.
     */
    async findOne(id: string): Promise<Tenant | null> {
        return this.prisma.tenant.findUnique({
            where: { id },
        });
    }


    /**
     * Obtiene todos los tenants registrados en el sistema.
     * @returns Lista de todos los tenants.
     */
    async findAll(): Promise<Tenant[]> {
        return this.prisma.tenant.findMany({
            orderBy: { name: 'asc' }
        });
    }
}
