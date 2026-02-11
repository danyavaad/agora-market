/*
 * File: app.module.ts
 * Purpose: Módulo raíz que orquesta todos los dominios y servicios del sistema.
 * Dependencies: PrismaModule, TenantsModule, SeasonsModule, OffersModule, OrdersModule, AuthModule, ProductsModule, FeedModule, DeliveryModule, ReviewModule, ChatModule, UploadsModule
 * Domain: Core
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantGuard } from './common/guards/tenant.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { SeasonsModule } from './seasons/seasons.module';
import { OffersModule } from './offers/offers.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { FeedModule } from './feed/feed.module';
import { DeliveryModule } from './delivery/delivery.module';
import { ReviewModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    TenantsModule,
    SeasonsModule,
    OffersModule,
    OrdersModule,
    FeedModule,
    DeliveryModule,
    ReviewModule,
    ChatModule,
    AuthModule,
    ProductsModule,
    UploadsModule,
    UsersModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: TenantGuard,
    },
  ],
})
export class AppModule { }
