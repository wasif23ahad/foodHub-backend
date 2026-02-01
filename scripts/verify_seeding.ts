
import prisma from "../src/lib/prisma";

async function verify() {
    console.log("🔍 Verifying Data...");

    const categories = await prisma.category.findMany();
    console.log(`📂 Categories Found: ${categories.length}`);
    categories.forEach(c => console.log(`   - ${c.name}`));

    const meals = await prisma.meal.findMany({
        include: { category: true }
    });
    console.log(`🍲 Meals Found: ${meals.length}`);

    const provider = await prisma.user.findUnique({ where: { email: "provider@foodhub.com" } });
    console.log(provider ? "✅ Provider Exists" : "❌ Provider Missing");

    process.exit(0);
}

verify();
