/*
 * File: seed-user.ts
 * Purpose: Seed a producer user with password
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// @ts-ignore
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to database...');
    await prisma.$connect();

    console.log('Upserting DefaultTenant...');
    const tenant = await prisma.tenant.create({
        data: {
            name: 'DefaultTenant',
        },
    });
    console.log('Tenant created with ID:', tenant.id);

    const password = await bcrypt.hash('password123', 10);

    console.log('Creating Producer User...');
    const producer = await prisma.user.create({
        data: {
            email: 'producer@test.com',
            name: 'Test Producer',
            role: 'producer',
            tenantId: tenant.id,
            password: password,
        },
    });

    console.log('User created:', producer);
}

main()
    .catch((e) => {
        console.error('Error in seed script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
