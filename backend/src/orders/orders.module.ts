/*
 * File: orders.module.ts
 * Purpose: Módulo para la gestión de pedidos y el mercado.
 * Dependencies: OrdersController, OrdersService
 * Domain: Pedidos
 */
import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';


@Module({
    imports: [],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
