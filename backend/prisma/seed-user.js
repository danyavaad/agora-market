/*
 * File: seed-user.js
 * Purpose: Seed a producer user with password
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient(); // Should work now with engineType="library"

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
    try {
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
    } catch (e) {
        // P2002 is unique constraint violation
        if (e.code === 'P2002') {
            console.log('User already exists.');
        } else {
            throw e;
        }
    }
}

main()
    .catch((e) => {
        console.error('Error in seed script:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
