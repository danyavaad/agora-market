/*
 * File: offers.module.ts
 * Purpose: Módulo para la gestión de ofertas de productores.
 * Dependencies: OffersController, OffersService
 * Domain: Ofertas
 */
import { Module } from '@nestjs/common';
import { OffersService } from './services/offers.service';
import { OffersController } from './controllers/offers.controller';


@Module({
    imports: [],
    controllers: [OffersController],
    providers: [OffersService],
    exports: [OffersService],
})
export class OffersModule { }
