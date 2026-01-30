/*
 * File: seasons.module.ts
 * Purpose: NestJS module definition for the Seasons domain.
 * Dependencies: SeasonsController, SeasonsService
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
