import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    try {
        const mealCount = await prisma.meal.count();
        const categoryCount = await prisma.category.count();
        const providerCount = await prisma.provider.count();
        console.log(`✅ DB Check: Found ${mealCount} meals, ${categoryCount} categories, ${providerCount} providers.`);
        console.log("Database URL used:", process.env.DATABASE_URL?.split("@")[1]); // Log host only for safety
    } catch (e) {
        console.error("❌ DB Connection Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
