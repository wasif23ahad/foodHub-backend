
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Checking DB with Node...");
    try {
        const count = await prisma.meal.count();
        console.log("Meals count:", count);
        const categories = await prisma.category.count();
        console.log("Categories count:", categories);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
