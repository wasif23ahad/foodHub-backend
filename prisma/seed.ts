import "dotenv/config";
import prisma from "../src/lib/prisma";
import { Role } from "../generated/prisma/enums";

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Create Admin User
    const adminEmail = process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com";
    const adminPassword = process.env["ADMIN_PASSWORD"] ?? "admin123";

    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        // Note: In production, BetterAuth handles password hashing
        // For seed, we create the user record directly
        // You'll need to use BetterAuth's signUp to properly hash password
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: "Admin",
                role: Role.ADMIN,
                emailVerified: true,
            },
        });
        console.log(`✅ Admin user created: ${admin.email}`);
        console.log(`   ⚠️  Note: Use BetterAuth signup endpoint to set password properly`);
    } else {
        console.log(`ℹ️  Admin user already exists: ${existingAdmin.email}`);
    }

    // 2. Seed Categories
    const categories = [
        { name: "Fast Food", description: "Quick and convenient meals" },
        { name: "Pizza", description: "Delicious pizza varieties" },
        { name: "Asian Cuisine", description: "Chinese, Japanese, Thai and more" },
        { name: "Indian", description: "Traditional Indian dishes and curries" },
        { name: "Mexican", description: "Tacos, burritos, and Mexican favorites" },
        { name: "Italian", description: "Pasta, risotto, and Italian classics" },
        { name: "Healthy", description: "Nutritious and healthy meal options" },
        { name: "Desserts", description: "Sweet treats and desserts" },
        { name: "Beverages", description: "Drinks and refreshments" },
        { name: "Breakfast", description: "Morning meals and brunch items" },
    ];

    for (const category of categories) {
        const existing = await prisma.category.findUnique({
            where: { name: category.name },
        });

        if (!existing) {
            await prisma.category.create({ data: category });
            console.log(`✅ Category created: ${category.name}`);
        } else {
            console.log(`ℹ️  Category already exists: ${category.name}`);
        }
    }

    console.log("\n🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
