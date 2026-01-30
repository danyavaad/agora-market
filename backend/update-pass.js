const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
    const password = await bcrypt.hash('password123', 10);
    await prisma.user.update({
        where: { email: 'producer@huertify.local' },
        data: { password }
    });
    console.log('Password updated for producer@huertify.local');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
