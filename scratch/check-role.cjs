const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const u = await prisma.user.findUnique({ where: { email: 'admin@foodhub.com' } });
    console.log('Role JSON:', JSON.stringify(u.role));
    console.log('Role Type:', typeof u.role);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
