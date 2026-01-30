import { Module } from '@nestjs/common';
import { DeliveryService } from './services/delivery.service';
import { DeliveryController } from './controllers/delivery.controller';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [DeliveryController],
    providers: [DeliveryService, PrismaService],
})
export class DeliveryModule { }
