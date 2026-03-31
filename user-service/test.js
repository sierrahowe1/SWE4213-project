
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        // Test connection
        const result = await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connected!');
        
        // Count users
        const userCount = await prisma.users.count();
        console.log(`📊 Users in database: ${userCount}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
