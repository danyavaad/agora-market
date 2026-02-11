/*
 * File: seasons.module.ts
 * Purpose: NestJS module definition for the Seasons domain.
 * Dependencies: SeasonsController, SeasonsService
 */

/*
 * File: seasons.module.ts
 * Purpose: Módulo para la gestión de temporadas y rotación de productores.
 * Dependencies: SeasonsController, SeasonsService
 * Domain: Temporadas
 */
import { Module } from '@nestjs/common';
import { SeasonsService } from './services/seasons.service';
import { SeasonsController } from './controllers/seasons.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [SeasonsController],
    providers: [SeasonsService, PrismaService],
})
export class SeasonsModule { }
