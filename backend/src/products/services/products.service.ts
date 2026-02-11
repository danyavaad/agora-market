/*
 * File: products.service.ts
 * Purpose: Servicio que contiene la lógica de negocio para la gestión de productos.
 * Dependencies: PrismaService
 * Domain: Productos
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }


    /**
     * Obtiene todos los productos asociados a un tenant específico.
     * @param tenantId Identificador único del tenant (Coop/Nodo).
     * @returns Una lista de productos.
     */
    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId }
        });
    }


    /**
     * Busca un producto específico por su ID dentro de un tenant.
     * @param tenantId Identificador único del tenant.
     * @param id Identificador único del producto.
     * @returns El producto encontrado o null si no existe.
     */
    async findOne(tenantId: string, id: string) {
        return this.prisma.product.findFirst({
            where: { id, tenantId }
        });
    }
}
