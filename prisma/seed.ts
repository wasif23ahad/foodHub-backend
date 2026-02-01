import "dotenv/config";
import prisma from "../src/lib/prisma";
import { Role } from "../generated/prisma/client";
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
        } catch (error: any) {
            console.error(`❌ Failed to create admin:`, error.message || error);
        }
    } else {
        console.log(`ℹ️  Admin user already exists: ${existingAdmin.email}`);
    }

    // 2. Create/Get Provider User & Profile
    const providerEmail = "provider@foodhub.com";
    const providerPassword = "provider123";
    const providerName = "Fresh Foods Provider";

    let providerUser = await prisma.user.findUnique({ where: { email: providerEmail } });
    if (!providerUser) {
        try {
            const result = await auth.api.signUpEmail({
                body: {
                    email: providerEmail,
                    password: providerPassword,
                    name: providerName,
                },
            });
            if (result.user) {
                providerUser = await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: Role.PROVIDER, emailVerified: true }
                });
                console.log(`✅ Provider user created: ${providerEmail}`);
            }
        } catch (e) {
            console.error("Failed to create provider:", e);
        }
    } else {
        console.log(`ℹ️  Provider user already exists: ${providerEmail}`);
    }

    if (!providerUser) throw new Error("Could not ensure provider user exists");

    const providerProfile = await prisma.providerProfile.upsert({
        where: { userId: providerUser.id },
        update: {},
        create: {
            userId: providerUser.id,
            businessName: "Fresh Foods Kitchen",
            cuisineType: "Multi-Cuisine",
            description: "Serving fresh and delicious meals across all categories.",
            address: "123 Food Street, Culinary City",
            contactEmail: providerEmail
        }
    });
    console.log(`✅ Provider profile ready: ${providerProfile.businessName}`);

    // 3. Align Categories
    // Define the exact mapping required by frontend
    const requiredCategories = [
        { name: "Italian", mapping: "Asian Cuisine" }, // Example of potential rename logic if needed strictly, but here we just list target names
        { name: "Asian" },
        { name: "Burgers" },
        { name: "Healthy" },
        { name: "Breakfast" },
        { name: "Salads" },
        { name: "Desserts" },
        { name: "Deshi" },
        { name: "Biriyani" },
        { name: "Kababs" },
        { name: "Naan" },
        // Extras that might exist or be good to have
        { name: "Fast Food" },
        { name: "Pizza" }, // "Pizza" maps to Italian usually but frontend requested "Italian" explicitly. Keeping Pizza as separate if needed or requested, but user said "Italian -> Pizza Icon". Wait, user said "Italian -> Pizza Icon".
        // The user list: Italian, Asian, Burgers, Healthy, Breakfast, Salads, Desserts, Deshi, Biriyani, Kababs, Naan.
    ];

    // Specific renaming map to clean up old data if it exists
    const renames: Record<string, string> = {
        "Asian Cuisine": "Asian",
    };

    for (const [oldName, newName] of Object.entries(renames)) {
        const oldCat = await prisma.category.findUnique({ where: { name: oldName } });
        if (oldCat) {
            // Check if new name already exists
            const targetCat = await prisma.category.findUnique({ where: { name: newName } });
            if (targetCat) {
                // If both exist, we might want to move meals to new CAtegory and delete old, OR just delete old if no meals.
                // For safety in this task, let's just delete the OLD one if it has no meals, or warn. 
                // Simpler: Just update the name if the new name doesn't exist.
                console.log(`⚠️ Cannot rename '${oldName}' to '${newName}' because '${newName}' already exists. skipping rename.`);
            } else {
                await prisma.category.update({
                    where: { id: oldCat.id },
                    data: { name: newName }
                });
                console.log(`🔄 Renamed category '${oldName}' to '${newName}'`);
            }
        }
    }

    // Upsert all required categories
    const categoryMap = new Map<string, string>(); // Name -> ID

    const categoryList = [
        "Italian", "Asian", "Burgers", "Healthy", "Breakfast", "Salads", "Desserts", "Deshi", "Biriyani", "Kababs", "Naan", "Pizza", "Fast Food"
    ];

    for (const name of categoryList) {
        const cat = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name, description: `Delicious ${name} options` }
        });
        categoryMap.set(name, cat.id);
        console.log(`✅ Category ensured: ${name}`);
    }

    // 4. Seed Meals
    // We need 3-4 meals for the requested categories
    const mealsToSeed = [
        // Italian (Pizza Icon) - Seeding Pizzas/Pastas
        { name: "Margherita Pizza", category: "Italian", price: 12.99, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002", description: "Classic tomato and mozzarella pizza" },
        { name: "Pepperoni Feast", category: "Italian", price: 14.99, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e", description: "Spicy pepperoni with extra cheese" },
        { name: "Pasta Carbonara", category: "Italian", price: 11.50, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3", description: "Creamy pasta with pancetta" },

        // Asian (Soup Icon)
        { name: "Ramen Bowl", category: "Asian", price: 10.99, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624", description: "Hot miso ramen with soft egg" },
        { name: "Sushi Platter", category: "Asian", price: 18.99, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c", description: "Fresh salmon and tuna sushi rolls" },
        { name: "Pad Thai", category: "Asian", price: 11.99, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e", description: "Stir-fried rice noodle dish" },

        // Burgers (Beef Icon)
        { name: "Classic Cheeseburger", category: "Burgers", price: 9.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", description: "Juicy beef patty with cheddar cheese" },
        { name: "Double Bacon Burger", category: "Burgers", price: 12.99, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5", description: "Double beef with crispy bacon" },
        { name: "Veggie Delight", category: "Burgers", price: 8.99, image: "https://images.unsplash.com/photo-1550547660-d9450f859349", description: "Plant-based burger with fresh veggies" },

        // Healthy (Carrot Icon)
        { name: "Quinoa Salad Bowl", category: "Healthy", price: 10.50, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Nutrient-packed quinoa and greens" },
        { name: "Grilled Chicken Breast", category: "Healthy", price: 13.99, image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435", description: "Lean chicken with steamed vegetables" },
        { name: "Avocado Toast", category: "Healthy", price: 8.50, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d", description: "Whole grain toast with fresh avocado" },

        // Breakfast (Coffee Icon)
        { name: "Full English Breakfast", category: "Breakfast", price: 11.99, image: "https://images.unsplash.com/photo-1533089862017-a0db5d742961", description: "Eggs, bacon, sausages, and beans" },
        { name: "Pancakes Stack", category: "Breakfast", price: 9.50, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", description: "Fluffy pancakes with maple syrup" },
        { name: "Oatmeal Bowl", category: "Breakfast", price: 6.99, image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf", description: "Warm oatmeal with berries and honey" },

        // Salads (Salad Icon)
        { name: "Caesar Salad", category: "Salads", price: 9.99, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1", description: "Crisp romaine with parmesan" },
        { name: "Greek Salad", category: "Salads", price: 10.50, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe", description: "Feta, olives, and fresh cucumber" },
        { name: "Cobb Salad", category: "Salads", price: 11.99, image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082", description: "Classic mix of greens and protein" },

        // Desserts (Desserts Icon)
        { name: "Chocolate Cake", category: "Desserts", price: 6.50, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", description: "Rich and moist chocolate slice" },
        { name: "Cheesecake", category: "Desserts", price: 7.00, image: "https://images.unsplash.com/photo-1524351199678-c41985b90ec2", description: "Creamy classic New York cheesecake" },
        { name: "Ice Cream Sundae", category: "Desserts", price: 5.99, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", description: "Vanilla scoops with hot fudge" },

        // Deshi (Deshi Icon)
        { name: "Beef Bhuna", category: "Deshi", price: 12.99, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Spicy slow-cooked beef curry" },
        { name: "Fish Curry", category: "Deshi", price: 11.50, image: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98", description: "Traditional fish prepared in spicy sauce" },
        { name: "Chicken Roast", category: "Deshi", price: 10.99, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46", description: "Roast chicken with traditional spices" },

        // Biriyani (Biriyani Icon)
        { name: "Chicken Biriyani", category: "Biriyani", price: 13.99, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", description: "Aromatic basmati rice with chicken" },
        { name: "Mutton Biriyani", category: "Biriyani", price: 15.99, image: "https://images.unsplash.com/photo-1642821373181-696a54913e93", description: "Classic Kacchi style mutton biriyani" },
        { name: "Veg Biriyani", category: "Biriyani", price: 10.99, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0", description: "Flavorful vegetable rice dish" },

        // Kababs (Kababs Icon)
        { name: "Seekh Kabab", category: "Kababs", price: 8.99, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Minced meat grilled skewers" },
        { name: "Chicken Tikka", category: "Kababs", price: 9.50, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Marinated grilled chicken chunks" }, // Resuing image
        { name: "Reshmi Kabab", category: "Kababs", price: 10.50, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398", description: "Silky texture chicken kababs" },

        // Naan (Naan Icon)
        { name: "Butter Naan", category: "Naan", price: 2.50, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Soft fluffy bread with butter" },
        { name: "Garlic Naan", category: "Naan", price: 3.00, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Naan topped with minced garlic" },
        { name: "Cheese Naan", category: "Naan", price: 3.50, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Stuffed with melting cheese" }
    ];

    let mealsCreated = 0;
    for (const meal of mealsToSeed) {
        const catId = categoryMap.get(meal.category);
        if (!catId) {
            console.warn(`⚠️ Skipped meal '${meal.name}' because category '${meal.category}' was not found.`);
            continue;
        }

        const existingMeal = await prisma.meal.findFirst({
            where: {
                name: meal.name,
                providerProfileId: providerProfile.id
            }
        });

        if (!existingMeal) {
            await prisma.meal.create({
                data: {
                    name: meal.name,
                    description: meal.description,
                    price: meal.price,
                    image: meal.image,
                    categoryId: catId,
                    providerProfileId: providerProfile.id,
                    isAvailable: true,
                    preparationTime: 20
                }
            });
            mealsCreated++;
        }
    }
    console.log(`✅ Seeded ${mealsCreated} new meals.`);

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
