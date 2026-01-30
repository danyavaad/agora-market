import { Module } from '@nestjs/common';
import { TenantsController } from './controllers/tenants.controller';
import { TenantsService } from './services/tenants.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, PrismaService]
})
export class TenantsModule { }
