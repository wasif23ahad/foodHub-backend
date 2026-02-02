import "dotenv/config";
import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
    console.log("🌱 Starting final cleanup & seed...");

    // 1. Create Admin User
    const adminEmail = "admin@foodhub.com";
    const adminPassword = "admin123";
    const adminName = "FoodHub Admin";

    let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
        try {
            const result = await auth.api.signUpEmail({
                body: { email: adminEmail, password: adminPassword, name: adminName },
            });
            if (result.user) {
                adminUser = await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: "ADMIN", emailVerified: true }
                });
                console.log(`✅ Admin user created: ${adminEmail}`);
            }
        } catch (e) {
            console.error("Failed to create admin:", e);
        }
    }

    // 2. Clear existing data (to ensure clean slate with reduced categories/providers)
    // We don't delete users to avoid breaking auth, but we reset profiles and data
    console.log("🧹 Cleaning up old data types...");
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.providerProfile.deleteMany({});
    await prisma.category.deleteMany({});

    // 3. Ensure Categories
    const categories = [
        { name: "Deshi", folder: "deshi" },
        { name: "Biriyani", folder: "biriyani" },
        { name: "Kababs", folder: "kababs" },
        { name: "Pizza & Italian", folder: "pizza&Italian" },
        { name: "Burgers & Fast Food", folder: "burgers&FastFood" },
        { name: "Healthy & Salads", folder: "healthy&salads" },
        { name: "Breakfast", folder: "breakfast" },
        { name: "Desserts", folder: "desserts" },
        { name: "Naan", folder: "naan" },
        { name: "Nihari", folder: "nihari" },
        { name: "Beverages", folder: "beverages" }
    ];

    const categoryMap = new Map<string, string>();
    const categoryImages: Record<string, string> = {
        "Deshi": "beef-kala-bhuna.jpg",
        "Biriyani": "kacchi-biriyani.jpg",
        "Kababs": "sheek-kabab.jpg",
        "Pizza & Italian": "margherita-pizza.jpg",
        "Burgers & Fast Food": "classic-cheeseburger.jpg",
        "Healthy & Salads": "greek-salad.jpg",
        "Breakfast": "full-english-breakfast.jpg",
        "Desserts": "gulab-jamun.jpg",
        "Naan": "butter-naan.jpg",
        "Nihari": "nihari-special.jpg",
        "Beverages": "lacchi.jpg"
    };

    for (const cat of categories) {
        const created = await prisma.category.create({
            data: {
                name: cat.name,
                description: `Best ${cat.name} in town.`,
                image: null
            }
        });
        categoryMap.set(cat.name, created.id);
    }
    console.log(`✅ ${categories.length} categories created.`);

    // 4. Create 10 Curated Providers
    const providersToSeed = [
        { name: "Old Dhaka Kitchen", cuisine: "Deshi", desc: "Authentic Old Dhaka Tehari and Biriyani.", img: "old-dhaka-kitchen.jpg" },
        { name: "Sultanic Biriyani", cuisine: "Biriyani", desc: "Premium Kacchi Biriyani specialists.", img: "sultanic-biriyani.jpg" },
        { name: "Kabab Kingdom", cuisine: "Kababs", desc: "Ultimate destination for grilled meat lovers.", img: "kabab-kingdom.jpg" },
        { name: "The Pizza Press", cuisine: "Pizza & Italian", desc: "Hand-tossed artisanal pizzas.", img: "the-pizza-press.jpg" },
        { name: "Burger Bastion", cuisine: "Burgers & Fast Food", desc: "Gourmet beef and chicken burgers.", img: "burger-bastion.jpg" },
        { name: "Healthy Harvest", cuisine: "Healthy & Salads", desc: "Nutrient-rich salads and bowls.", img: "healthy-harvest.jpg" },
        { name: "Morning Dew Cafe", cuisine: "Breakfast", desc: "Start your day with signature platters.", img: "morning-dew-cafe.jpg" },
        { name: "Sweet Tooth Delights", cuisine: "Desserts", desc: "Traditional and modern sweets.", img: "sweet-tooth.jpg" },
        { name: "Naan Stop", cuisine: "Naan", desc: "Freshly baked tandoori breads.", img: "naan-stop.jpg" },
        { name: "The Pasta Parlor", cuisine: "Pizza & Italian", desc: "Creamy and authentic Italian pasta.", img: "pasta-parlor.jpg" },
    ];

    const providerProfiles = [];
    for (const p of providersToSeed) {
        const safeName = p.name.toLowerCase().replace(/[^a-z.\s]/g, "").replace(/\s+/g, ".");
        const email = `${safeName}@foodhub.com`;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const result = await auth.api.signUpEmail({
                body: { email, password: "password123", name: p.name },
            });
            if (result.user) {
                user = await prisma.user.update({
                    where: { id: result.user.id },
                    data: { role: "PROVIDER", emailVerified: true }
                });
            }
        }

        if (user) {
            const profile = await prisma.providerProfile.create({
                data: {
                    userId: user.id,
                    businessName: p.name,
                    description: p.desc,
                    logo: null,
                    cuisineType: p.cuisine,
                    isActive: true,
                    address: "Local Delivery Center"
                }
            });
            providerProfiles.push(profile);
        }
    }
    console.log(`✅ ${providerProfiles.length} providers created.`);

    // 5. Create Final Meals
    const mealDataMap: any = {
        "Deshi": [
            { name: "Beef Kala Bhuna", price: 450, img: "beef-kala-bhuna.jpg" },
            { name: "Shorshe Ilish", price: 550, img: "shorshe-ilish.jpg" },
            { name: "Chingri Malai Curry", price: 650, img: "chingri-malai-curry.jpg" },
            { name: "Mutton Rezala", price: 480, img: "mutton-rezala.jpg" },
            { name: "Bhuna Khichuri", price: 320, img: "bhuna-khichuri.jpg" },
            { name: "Morog Polao", price: 380, img: "morog-polao.jpg" },
            { name: "Old Dhaka Tehari", price: 300, img: "old-dhaka-tehari.jpg" },
            { name: "Beef Bhuna", price: 350, img: "beef-bhuna.jpg" },
            { name: "Rui Fish Curry", price: 280, img: "rui-fish-curry.jpg" },
            { name: "Shutki Bhuna", price: 250, img: "shutki-bhuna.jpg" },
            { name: "Aloo Bhorta", price: 50, img: "aloo-bhorta.jpg" },
            { name: "Begun Bhorta", price: 80, img: "begun-bhorta.jpg" },
            { name: "Hash Bhuna", price: 550, img: "hash-bhuna.jpg" },
            { name: "Panta Ilish", price: 400, img: "panta-ilish.jpg" },
            { name: "Vegetable Labra", price: 120, img: "vegetable-labra.jpg" },
        ],
        "Nihari": [
            { name: "Nihari Special", price: 450, img: "nihari-special.jpg" },
            { name: "Nalli Nihari", price: 550, img: "nalli-nihari.jpg" },
        ],
        "Beverages": [
            { name: "Lacchi", price: 120, img: "lacchi.jpg" },
            { name: "Badam Shorbot", price: 150, img: "badam-shorbot.jpg" },
            { name: "Jafrani Shorbot", price: 180, img: "jafrani-shorbot.jpg" },
        ],
        "Biriyani": [
            { name: "Kacchi Biriyani", price: 550, img: "kacchi-biriyani.jpg" },
            { name: "Chicken Biriyani", price: 350, img: "chicken-biriyani.jpg" },
            { name: "Beef Biriyani", price: 420, img: "beef-biriyani.jpg" },
            { name: "Handi Biriyani", price: 450, img: "handi-biriyani.jpg" },
        ],
        "Kababs": [
            { name: "Sheek Kabab", price: 280, img: "sheek-kabab.jpg" },
            { name: "Chicken Tikka", price: 250, img: "chicken-tikka.jpg" },
            { name: "Reshmi Kabab", price: 300, img: "reshmi-kabab.jpg" },
            { name: "Shami Kabab", price: 200, img: "shami-kabab.jpg" },
            { name: "Boti Kabab", price: 320, img: "boti-kabab.jpg" },
            { name: "Tandoori Chicken", price: 350, img: "tandoori-chicken.jpg" },
            { name: "Grill Chicken", price: 380, img: "grill-chicken.jpg" },
        ],
        "Pizza & Italian": [
            { name: "Margherita Pizza", price: 650, img: "margherita-pizza.jpg" },
            { name: "Pepperoni Feast", price: 850, img: "pepperoni-feast.jpg" },
            { name: "BBQ Chicken Pizza", price: 800, img: "bbq-chicken-pizza.jpg" },
            { name: "Pasta Carbonara", price: 450, img: "pasta-carbonara.jpg" },
            { name: "Lasagna", price: 750, img: "lasagna.jpg" },
        ],
        "Burgers & Fast Food": [
            { name: "Classic Cheeseburger", price: 350, img: "classic-cheeseburger.jpg" },
            { name: "Double Bacon Burger", price: 450, img: "double-bacon-burger.jpg" },
            { name: "Crispy Chicken Burger", price: 320, img: "crispy-chicken-burger.jpg" },
            { name: "Chicken Nuggets", price: 250, img: "chicken-nuggets.jpg" },
            { name: "French Fries", price: 150, img: "french-fries.jpg" },
            { name: "Shingara", price: 20, img: "shingara.jpg" },
        ],
        "Healthy & Salads": [
            { name: "Greek Salad", price: 320, img: "greek-salad.jpg" },
            { name: "Avocado Toast", price: 250, img: "avocado-toast.jpg" },
        ],
        "Breakfast": [
            { name: "Full English Breakfast", price: 450, img: "full-english-breakfast.jpg" },
            { name: "Pancakes Stack", price: 320, img: "pancakes-stack.jpg" },
        ],
        "Desserts": [
            { name: "Gulab Jamun", price: 150, img: "gulab-jamun.jpg" },
            { name: "Rasmalai", price: 200, img: "rasmalai.jpg" },
            { name: "Kulfi", price: 100, img: "kulfi.jpg" },
            { name: "Chocolate Cake", price: 180, img: "chocolate-cake.jpg" },
            { name: "Cheesecake", price: 250, img: "cheesecake.jpg" },
        ],
        "Naan": [
            { name: "Butter Naan", price: 60, img: "butter-naan.jpg" },
            { name: "Garlic Naan", price: 80, img: "garlic-naan.jpg" },
        ]
    };

    let mealsCreated = 0;
    for (const [catName, meals] of Object.entries(mealDataMap)) {
        const catId = categoryMap.get(catName);
        const folder = categories.find(c => c.name === catName)?.folder || "deshi";
        if (!catId) continue;

        // Assign to a provider that matches cuisine or random
        let provider = providerProfiles.find(p => p.cuisineType === catName);
        if (!provider) provider = providerProfiles[Math.floor(Math.random() * providerProfiles.length)];

        const meals = mealDataMap[catName] as any[];
        for (const m of meals) {
            await prisma.meal.create({
                data: {
                    name: m.name,
                    description: `Delicious ${m.name} freshly prepared.`,
                    price: m.price,
                    image: null,
                    categoryId: catId,
                    providerProfileId: provider.id,
                    isAvailable: true,
                    preparationTime: 25
                }
            });
            mealsCreated++;
        }
    }

    console.log(`✅ ${mealsCreated} meals seeded.`);
    console.log("\n🎉 Database Re-Sync Completed!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
