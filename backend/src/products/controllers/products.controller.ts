/*
 * File: products.controller.ts
 * Purpose: REST API for product catalogue.
 */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    async findAll(@Param('tenantId') tenantId: string) {
        return this.productsService.findAll(tenantId);
    }

    @Get(':id')
    async findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
        return this.productsService.findOne(tenantId, id);
    }
}
