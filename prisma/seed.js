import "dotenv/config";
import prisma from "../src/lib/prisma";
import { Role } from "../generated/prisma/enums";
import { auth } from "../src/lib/auth";
async function main() {
    console.log("🌱 Starting seed...");
    // 1. Create Admin User with proper password hashing
    const adminEmail = process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com";
    const adminPassword = process.env["ADMIN_PASSWORD"] ?? "admin123";
    const adminName = process.env["ADMIN_NAME"] ?? "Admin";
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        try {
            // Use BetterAuth's API to create user with properly hashed password
            // Note: Role cannot be set during signup, so we create user first then update role
            const result = await auth.api.signUpEmail({
                body: {
                    email: adminEmail,
                    password: adminPassword,
                    name: adminName,
                },
            });
            if (result.user) {
                // Update the role to ADMIN after user is created
                await prisma.user.update({
                    where: { id: result.user.id },
                    data: {
                        role: Role.ADMIN,
                        emailVerified: true,
                    },
                });
                console.log(`✅ Admin user created: ${adminEmail}`);
                console.log(`   📧 Email: ${adminEmail}`);
                console.log(`   🔑 Password: ${adminPassword}`);
            }
        }
        catch (error) {
            console.error(`❌ Failed to create admin:`, error.message || error);
        }
    }
    else {
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
        { name: "Deshi", description: "Traditional Bengali and Bangladeshi cuisine" },
        { name: "Kababs", description: "Grilled meat specialties and kebabs" },
    ];
    for (const category of categories) {
        const existing = await prisma.category.findUnique({
            where: { name: category.name },
        });
        if (!existing) {
            await prisma.category.create({ data: category });
            console.log(`✅ Category created: ${category.name}`);
        }
        else {
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
//# sourceMappingURL=seed.js.map