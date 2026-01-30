import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { DeliveryService } from '../services/delivery.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants/:tenantId/delivery')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) { }

    @UseGuards(JwtAuthGuard)
    @Get('routes')
    async getRoutes(
        @Param('tenantId') tenantId: string,
        @Query('week') week: string
    ) {
        return this.deliveryService.getRouteSheet(tenantId, week);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':orderId/confirm')
    async confirm(
        @Param('tenantId') tenantId: string,
        @Param('orderId') orderId: string
    ) {
        return this.deliveryService.confirmDelivery(tenantId, orderId);
    }
}
