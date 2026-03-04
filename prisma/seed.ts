import "dotenv/config";
import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
    console.log("🌱 Starting final cleanup & seed (Local Images)...");

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

    // 2. Clear existing data
    console.log("🧹 Cleaning up old data types...");
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.providerProfile.deleteMany({});
    await prisma.category.deleteMany({});

    // 3. Ensure Categories (11)
    // Using local uploads for categories
    const categories = [
        { name: "Deshi", folder: "deshi", img: "/uploads/meals/beef-kala-bhuna.jpg" },
        { name: "Biriyani", folder: "biriyani", img: "/uploads/meals/kacchi-biriyani.jpg" },
        { name: "Kababs", folder: "kababs", img: "/uploads/meals/sheek-kabab.jpg" },
        { name: "Pizza & Italian", folder: "pizza&Italian", img: "/uploads/meals/margherita-pizza.jpg" },
        { name: "Burgers & Fast Food", folder: "burgers&FastFood", img: "/uploads/meals/classic-cheeseburger.jpg" },
        { name: "Healthy & Salads", folder: "healthy&salads", img: "/uploads/meals/greek-salad.jpg" },
        { name: "Breakfast", folder: "breakfast", img: "/uploads/meals/full-english-breakfast.jpg" },
        { name: "Desserts", folder: "desserts", img: "/uploads/meals/gulab-jamun.jpg" },
        { name: "Naan", folder: "naan", img: "/uploads/meals/butter-naan.jpg" },
        { name: "Nihari", folder: "nihari", img: "/uploads/meals/nihari-special.jpg" },
        { name: "Beverages", folder: "beverages", img: "/uploads/meals/lacchi.jpg" }
    ];

    const categoryMap = new Map<string, string>();

    for (const cat of categories) {
        const created = await prisma.category.create({
            data: {
                name: cat.name,
                description: `Best ${cat.name} in town.`,
                image: cat.img,
                isFeatured: true
            }
        });
        categoryMap.set(cat.name, created.id);
    }
    console.log(`✅ ${categories.length} categories created.`);

    // 4. Create 10 Curated Providers
    // Using local uploads for providers
    const providersToSeed = [
        { name: "Old Dhaka Kitchen", cuisine: "Deshi", desc: "Authentic Old Dhaka Tehari and Biriyani.", img: "/uploads/providers/old-dhaka-kitchen.jpg" },
        { name: "Sultanic Biriyani", cuisine: "Biriyani", desc: "Premium Kacchi Biriyani specialists.", img: "/uploads/providers/sultanic-biriyani.jpg" },
        { name: "Kabab Kingdom", cuisine: "Kababs", desc: "Ultimate destination for grilled meat lovers.", img: "/uploads/providers/kabab-kingdom.jpg" },
        { name: "The Pizza Press", cuisine: "Pizza & Italian", desc: "Hand-tossed artisanal pizzas.", img: "/uploads/providers/the-pizza-press.jpg" },
        { name: "Burger Bastion", cuisine: "Burgers & Fast Food", desc: "Gourmet beef and chicken burgers.", img: "/uploads/providers/burger-bastion.jpg" },
        { name: "Healthy Harvest", cuisine: "Healthy & Salads", desc: "Nutrient-rich salads and bowls.", img: "/uploads/providers/healthy-harvest.jpg" },
        { name: "Morning Dew Cafe", cuisine: "Breakfast", desc: "Start your day with signature platters.", img: "/uploads/providers/morning-dew-cafe.jpg" },
        { name: "Sweet Tooth Delights", cuisine: "Desserts", desc: "Traditional and modern sweets.", img: "/uploads/providers/sweet-tooth.jpg" },
        { name: "Naan Stop", cuisine: "Naan", desc: "Freshly baked tandoori breads.", img: "/uploads/providers/naan-stop.jpg" },
        { name: "The Pasta Parlor", cuisine: "Pizza & Italian", desc: "Creamy and authentic Italian pasta.", img: "/uploads/providers/pasta-parlor.jpg" },
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
                    logo: p.img,
                    cuisineType: p.cuisine,
                    isActive: true,
                    address: "Local Delivery Center"
                }
            });
            providerProfiles.push(profile);
        }
    }
    console.log(`✅ ${providerProfiles.length} providers created.`);

    // 5. Create Final Meals (53 Total)
    // Using local uploads for meals
    const mealDataMap: any = {
        "Deshi": [
            { name: "Beef Kala Bhuna", price: 450, img: "/uploads/meals/beef-kala-bhuna.jpg", dietary: "HALAL" },
            { name: "Shorshe Ilish", price: 550, img: "/uploads/meals/shorshe-ilish.jpg", dietary: "HALAL" },
            { name: "Chingri Malai Curry", price: 650, img: "/uploads/meals/chingri-malai-curry.jpg", dietary: "HALAL" },
            { name: "Mutton Rezala", price: 480, img: "/uploads/meals/mutton-rezala.jpg", dietary: "HALAL" },
            { name: "Bhuna Khichuri", price: 320, img: "/uploads/meals/bhuna-khichuri.jpg", dietary: "VEGETARIAN" },
            { name: "Morog Polao", price: 380, img: "/uploads/meals/morog-polao.jpg", dietary: "HALAL" },
            { name: "Old Dhaka Tehari", price: 300, img: "/uploads/meals/old-dhaka-tehari.jpg", dietary: "HALAL" },
            { name: "Beef Bhuna", price: 350, img: "/uploads/meals/beef-bhuna.jpg", dietary: "HALAL" },
            { name: "Rui Fish Curry", price: 280, img: "/uploads/meals/rui-fish-curry.jpg", dietary: "HALAL" },
            { name: "Shutki Bhuna", price: 250, img: "/uploads/meals/shutki-bhuna.jpg", dietary: "HALAL" },
            { name: "Aloo Bhorta", price: 50, img: "/uploads/meals/aloo-bhorta.jpg", dietary: "VEGAN" },
            { name: "Begun Bhorta", price: 80, img: "/uploads/meals/begun-bhorta.jpg", dietary: "VEGAN" },
            { name: "Hash Bhuna", price: 550, img: "/uploads/meals/hash-bhuna.jpg", dietary: "HALAL" },
            { name: "Panta Ilish", price: 400, img: "/uploads/meals/panta-ilish.jpg", dietary: "HALAL" },
            { name: "Vegetable Labra", price: 120, img: "/uploads/meals/vegetable-labra.jpg", dietary: "VEGAN" },
        ],
        "Nihari": [
            { name: "Nihari Special", price: 450, img: "/uploads/meals/nihari-special.jpg", dietary: "HALAL" },
            { name: "Nalli Nihari", price: 550, img: "/uploads/meals/nalli-nihari.jpg", dietary: "HALAL" },
        ],
        "Beverages": [
            { name: "Lacchi", price: 120, img: "/uploads/meals/lacchi.jpg", dietary: "VEGETARIAN" },
            { name: "Badam Shorbot", price: 150, img: "/uploads/meals/badam-shorbot.jpg", dietary: "VEGAN" },
            { name: "Jafrani Shorbot", price: 180, img: "/uploads/meals/jafrani-shorbot.jpg", dietary: "VEGAN" },
        ],
        "Biriyani": [
            { name: "Kacchi Biriyani", price: 550, img: "/uploads/meals/kacchi-biriyani.jpg", dietary: "HALAL" },
            { name: "Chicken Biriyani", price: 350, img: "/uploads/meals/chicken-biriyani.jpg", dietary: "HALAL" },
            { name: "Beef Biriyani", price: 420, img: "/uploads/meals/beef-biriyani.jpg", dietary: "HALAL" },
            { name: "Handi Biriyani", price: 450, img: "/uploads/meals/handi-biriyani.jpg", dietary: "HALAL" },
        ],
        "Kababs": [
            { name: "Sheek Kabab", price: 280, img: "/uploads/meals/sheek-kabab.jpg", dietary: "HALAL" },
            { name: "Chicken Tikka", price: 250, img: "/uploads/meals/chicken-tikka.jpg", dietary: "HALAL" },
            { name: "Reshmi Kabab", price: 300, img: "/uploads/meals/reshmi-kabab.jpg", dietary: "HALAL" },
            { name: "Shami Kabab", price: 200, img: "/uploads/meals/shami-kabab.jpg", dietary: "HALAL" },
            { name: "Boti Kabab", price: 320, img: "/uploads/meals/boti-kabab.jpg", dietary: "HALAL" },
            { name: "Tandoori Chicken", price: 350, img: "/uploads/meals/tandoori-chicken.jpg", dietary: "HALAL" },
            { name: "Grill Chicken", price: 380, img: "/uploads/meals/grill-chicken.jpg", dietary: "KETO" },
        ],
        "Pizza & Italian": [
            { name: "Margherita Pizza", price: 650, img: "/uploads/meals/margherita-pizza.jpg", dietary: "VEGETARIAN" },
            { name: "Pepperoni Feast", price: 850, img: "/uploads/meals/pepperoni-feast.jpg", dietary: "REGULAR" },
            { name: "BBQ Chicken Pizza", price: 800, img: "/uploads/meals/bbq-chicken-pizza.jpg", dietary: "REGULAR" },
            { name: "Pasta Carbonara", price: 450, img: "/uploads/meals/pasta-carbonara.jpg", dietary: "REGULAR" },
            { name: "Lasagna", price: 750, img: "/uploads/meals/lasagna.jpg", dietary: "REGULAR" },
        ],
        "Burgers & Fast Food": [
            { name: "Classic Cheeseburger", price: 350, img: "/uploads/meals/classic-cheeseburger.jpg", dietary: "REGULAR" },
            { name: "Double Bacon Burger", price: 450, img: "/uploads/meals/double-bacon-burger.jpg", dietary: "REGULAR" },
            { name: "Crispy Chicken Burger", price: 320, img: "/uploads/meals/crispy-chicken-burger.jpg", dietary: "HALAL" },
            { name: "Chicken Nuggets", price: 250, img: "/uploads/meals/chicken-nuggets.jpg", dietary: "HALAL" },
            { name: "French Fries", price: 150, img: "/uploads/meals/french-fries.jpg", dietary: "VEGAN" },
            { name: "Shingara", price: 20, img: "/uploads/meals/shingara.jpg", dietary: "VEGETARIAN" },
        ],
        "Healthy & Salads": [
            { name: "Greek Salad", price: 320, img: "/uploads/meals/greek-salad.jpg", dietary: "VEGETARIAN" },
            { name: "Avocado Toast", price: 250, img: "/uploads/meals/avocado-toast.jpg", dietary: "VEGAN" },
        ],
        "Breakfast": [
            { name: "Full English Breakfast", price: 450, img: "/uploads/meals/full-english-breakfast.jpg", dietary: "REGULAR" },
            { name: "Pancakes Stack", price: 320, img: "/uploads/meals/pancakes-stack.jpg", dietary: "VEGETARIAN" },
        ],
        "Desserts": [
            { name: "Gulab Jamun", price: 150, img: "/uploads/meals/gulab-jamun.jpg", dietary: "VEGETARIAN" },
            { name: "Rasmalai", price: 200, img: "/uploads/meals/rasmalai.jpg", dietary: "VEGETARIAN" },
            { name: "Kulfi", price: 100, img: "/uploads/meals/kulfi.jpg", dietary: "VEGETARIAN" },
            { name: "Chocolate Cake", price: 180, img: "/uploads/meals/chocolate-cake.jpg", dietary: "VEGETARIAN" },
            { name: "Cheesecake", price: 250, img: "/uploads/meals/cheesecake.jpg", dietary: "VEGETARIAN" },
        ],
        "Naan": [
            { name: "Butter Naan", price: 60, img: "/uploads/meals/butter-naan.jpg", dietary: "VEGETARIAN" },
            { name: "Garlic Naan", price: 80, img: "/uploads/meals/garlic-naan.jpg", dietary: "VEGAN" },
        ]
    };

    let mealsCreated = 0;
    for (const [catName, meals] of Object.entries(mealDataMap)) {
        const catId = categoryMap.get(catName);
        if (!catId) continue;

        let provider = providerProfiles.find(p => p.cuisineType === catName);
        if (!provider) provider = providerProfiles[Math.floor(Math.random() * providerProfiles.length)];

        const mealList = meals as any[];
        for (const m of mealList) {
            await prisma.meal.create({
                data: {
                    name: m.name,
                    description: `Delicious ${m.name} freshly prepared.`,
                    price: m.price,
                    image: m.img,
                    categoryId: catId,
                    providerProfileId: provider.id,
                    dietaryPreference: m.dietary || "REGULAR",
                    isAvailable: true,
                    preparationTime: 25
                }
            });
            mealsCreated++;
        }
    }

    console.log(`✅ ${mealsCreated} meals seeded.`);
    console.log("\n🎉 Database Re-Sync Completed (Local Images)!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
