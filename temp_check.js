
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
try {
    const c = await p.meal.count();
    console.log('COUNT:' + c);
} catch (e) { console.error(e); }
finally { await p.$disconnect(); }
