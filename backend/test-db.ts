import { PrismaClient } from '@prisma/client';

console.log('Instantiating client...');
try {
    const prisma = new PrismaClient();
    console.log('Client instantiated.');
    prisma.$connect().then(() => {
        console.log('Connected!');
        prisma.$disconnect();
    }).catch(e => console.error('Connect failed:', e));
} catch (e) {
    console.error('Instantiation failed:', e);
}
