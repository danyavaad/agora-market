/*
 * File: orders.controller.ts
 * Purpose: Endpoints REST para la gestión de pedidos y el mercado (Ágora).
 * Dependencies: OrdersService
 * Domain: Pedidos
 */

import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService, ProducerDeliveryGroup } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/market')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // Public/Protected: See what's available
    @Get('products')
    async getMarketProducts(
        @Param('tenantId') tenantId: string,
        @Query('week') week: string
    ) {
        if (!week) return [];
        return this.ordersService.getMarketProducts(tenantId, new Date(week));
    }

    // Protected: Place an order
    @UseGuards(JwtAuthGuard)
    @Post('orders')
    async createOrder(
        @Param('tenantId') tenantId: string,
        @Body() createOrderDto: CreateOrderDto,
        @Request() req: any
    ) {
        return this.ordersService.createOrder(tenantId, req.user.userId, createOrderDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-orders')
    async getMyOrders(
        @Param('tenantId') tenantId: string,
        @Request() req: any
    ) {
        return this.ordersService.getConsumerOrders(tenantId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('harvest-weight/:orderItemId')
    async updateHarvestWeight(
        @Param('tenantId') tenantId: string,
        @Param('orderItemId') orderItemId: string,
        @Body('realWeightKg') realWeightKg: number,
        @Request() req: any
    ) {
        return this.ordersService.updateHarvestWeight(tenantId, req.user.userId, orderItemId, realWeightKg);
    }

    @UseGuards(JwtAuthGuard)
    @Get('picking-list')
    async getPickingList(
        @Param('tenantId') tenantId: string,
        @Query('week') week: string,
        @Request() req: any
    ) {
        if (!week) return [];
        return this.ordersService.getPickingList(tenantId, req.user.userId, week);
    }

    @UseGuards(JwtAuthGuard)
    @Post('confirm-pickup')
    async confirmPickup(
        @Param('tenantId') tenantId: string,
        @Body('qrToken') qrToken: string,
        @Request() req: any
    ) {
        return this.ordersService.confirmPickup(tenantId, req.user.userId, qrToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('producer-delivery/:producerId')
    async getProducerPendingDeliveries(
        @Param('tenantId') tenantId: string,
        @Param('producerId') producerId: string
    ): Promise<ProducerDeliveryGroup[]> {
        return this.ordersService.getProducerPendingDeliveries(tenantId, producerId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('confirm-producer-delivery')
    async confirmProducerDelivery(
        @Param('tenantId') tenantId: string,
        @Body() body: { producerId: string, orderId: string },
        @Request() req: any
    ) {
        return this.ordersService.confirmProducerDelivery(tenantId, body.producerId, body.orderId, req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('orders/:id')
    async cancelOrder(
        @Param('tenantId') tenantId: string,
        @Param('id') orderId: string,
        @Request() req: any
    ) {
        console.log(`[OrdersController] DELETE /orders/${orderId} hit! Tenant: ${tenantId}`);
        console.log(`[OrdersController] Auth user: ${req.user?.userId}`);
        return this.ordersService.cancelOrder(tenantId, req.user.userId, orderId);
    }
}
