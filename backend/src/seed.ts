/*
 * File: seed.ts
 * Purpose: Seed data using NestJS Context
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService);

    console.log('Seeding...');

    try {
        // Check if tenant exists
        let tenant = await prisma.tenant.findFirst({ where: { name: 'DefaultTenant' } });
        if (!tenant) {
            console.log('Creating Tenant...');
            tenant = await prisma.tenant.create({
                data: { name: 'DefaultTenant' }
            });
        }
        console.log('Tenant ID:', tenant.id);

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email: 'producer@test.com' } });
        if (!existingUser) {
            console.log('Creating Producer...');
            const password = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'producer@test.com',
                    name: 'Test Producer',
                    role: 'producer',
                    tenantId: tenant.id,
                    password: password,
                }
            });
            console.log('Producer created!');
        } else {
            console.log('Producer already exists.');
        }

        const user = await prisma.user.findUnique({ where: { email: 'producer@test.com' } });
        if (user) {
            console.log('Seeding Feed Posts...');
            await prisma.feedPost.createMany({
                data: [
                    {
                        tenantId: tenant.id,
                        producerId: user.id,
                        message: '¡Acabamos de sembrar los tomates rosas de este año! 🌿',
                        eventType: 'planting',
                        photoUrl: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800&auto=format&fit=crop'
                    },
                    {
                        tenantId: tenant.id,
                        producerId: user.id,
                        message: '¡Primera cosecha de brócoli de la temporada lista para el Ágora! ✨🥦',
                        eventType: 'harvest',
                        photoUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?q=80&w=800&auto=format&fit=crop'
                    }
                ]
            });
        }

    } catch (error) {
        console.error(error);
    }

    await app.close();
}
bootstrap();
