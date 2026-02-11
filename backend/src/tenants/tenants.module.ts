/*
 * File: tenants.module.ts
 * Purpose: Módulo para la gestión de tenants (Nodos/Cooperativas).
 * Dependencies: TenantsController, TenantsService
 * Domain: Administración
 */
import { Module } from '@nestjs/common';
import { TenantsController } from './controllers/tenants.controller';
import { TenantsService } from './services/tenants.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, PrismaService]
})
export class TenantsModule { }
