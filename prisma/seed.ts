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

    // 2. Clear existing data
    console.log("🧹 Cleaning up old data types...");
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.providerProfile.deleteMany({});
    await prisma.category.deleteMany({});

    // 3. Ensure Categories with Unsplash Images
    const categories = [
        { name: "Deshi", folder: "deshi", img: "https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=800&auto=format&fit=crop" },
        { name: "Biriyani", folder: "biriyani", img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop" },
        { name: "Kababs", folder: "kababs", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=800&auto=format&fit=crop" },
        { name: "Pizza & Italian", folder: "pizza&Italian", img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop" },
        { name: "Burgers & Fast Food", folder: "burgers&FastFood", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" },
        { name: "Healthy & Salads", folder: "healthy&salads", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop" },
        { name: "Breakfast", folder: "breakfast", img: "https://images.unsplash.com/photo-1533089862017-5f2694158bdd?q=80&w=800&auto=format&fit=crop" },
        { name: "Desserts", folder: "desserts", img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=800&auto=format&fit=crop" },
        { name: "Naan", folder: "naan", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800&auto=format&fit=crop" },
        { name: "Nihari", folder: "nihari", img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop" },
        { name: "Beverages", folder: "beverages", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop" }
    ];

    const categoryMap = new Map<string, string>();

    for (const cat of categories) {
        const created = await prisma.category.create({
            data: {
                name: cat.name,
                description: `Best ${cat.name} in town.`,
                image: cat.img
            }
        });
        categoryMap.set(cat.name, created.id);
    }
    console.log(`✅ ${categories.length} categories created.`);

    // 4. Create 10 Curated Providers
    const providersToSeed = [
        { name: "Old Dhaka Kitchen", cuisine: "Deshi", desc: "Authentic Old Dhaka Tehari and Biriyani.", img: "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=800&auto=format&fit=crop" },
        { name: "Sultanic Biriyani", cuisine: "Biriyani", desc: "Premium Kacchi Biriyani specialists.", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop" },
        { name: "Kabab Kingdom", cuisine: "Kababs", desc: "Ultimate destination for grilled meat lovers.", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop" },
        { name: "The Pizza Press", cuisine: "Pizza & Italian", desc: "Hand-tossed artisanal pizzas.", img: "https://images.unsplash.com/photo-1595854341625-f33ee10d6f2b?q=80&w=800&auto=format&fit=crop" },
        { name: "Burger Bastion", cuisine: "Burgers & Fast Food", desc: "Gourmet beef and chicken burgers.", img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop" },
        { name: "Healthy Harvest", cuisine: "Healthy & Salads", desc: "Nutrient-rich salads and bowls.", img: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=800&auto=format&fit=crop" },
        { name: "Morning Dew Cafe", cuisine: "Breakfast", desc: "Start your day with signature platters.", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop" },
        { name: "Sweet Tooth Delights", cuisine: "Desserts", desc: "Traditional and modern sweets.", img: "https://images.unsplash.com/photo-1506093848130-179427301c2e?q=80&w=800&auto=format&fit=crop" },
        { name: "Naan Stop", cuisine: "Naan", desc: "Freshly baked tandoori breads.", img: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e0?q=80&w=800&auto=format&fit=crop" },
        { name: "The Pasta Parlor", cuisine: "Pizza & Italian", desc: "Creamy and authentic Italian pasta.", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop" },
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

    // 5. Create Final Meals
    const mealDataMap: any = {
        "Deshi": [
            { name: "Beef Kala Bhuna", price: 450, img: "https://images.unsplash.com/photo-1606850780554-b55ea2ce98e5?q=80&w=800" },
            { name: "Shorshe Ilish", price: 550, img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800" },
            { name: "Chingri Malai Curry", price: 650, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800" },
            { name: "Mutton Rezala", price: 480, img: "https://images.unsplash.com/photo-1585937421612-70a008356f36?q=80&w=800" },
            { name: "Bhuna Khichuri", price: 320, img: "https://images.unsplash.com/photo-1631263098381-81d331008034?q=80&w=800" },
        ],
        "Nihari": [
            { name: "Nihari Special", price: 450, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800" },
            { name: "Nalli Nihari", price: 550, img: "https://images.unsplash.com/photo-1547922572-132d733519d0?q=80&w=800" },
        ],
        "Beverages": [
            { name: "Lacchi", price: 120, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800" },
            { name: "Badam Shorbot", price: 150, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=800" },
            { name: "Jafrani Shorbot", price: 180, img: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800" },
        ],
        "Biriyani": [
            { name: "Kacchi Biriyani", price: 550, img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800" },
            { name: "Chicken Biriyani", price: 350, img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=800" },
            { name: "Beef Biriyani", price: 420, img: "https://images.unsplash.com/photo-1642826938222-26d4053d2678?q=80&w=800" },
        ],
        "Kababs": [
            { name: "Sheek Kabab", price: 280, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800" },
            { name: "Chicken Tikka", price: 250, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800" },
            { name: "Reshmi Kabab", price: 300, img: "https://images.unsplash.com/photo-1603360946369-dc9bb6f54249?q=80&w=800" },
        ],
        "Pizza & Italian": [
            { name: "Margherita Pizza", price: 650, img: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800" },
            { name: "Pepperoni Feast", price: 850, img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800" },
            { name: "Pasta Carbonara", price: 450, img: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=800" },
        ],
        "Burgers & Fast Food": [
            { name: "Classic Cheeseburger", price: 350, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800" },
            { name: "Double Bacon Burger", price: 450, img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?q=80&w=800" },
            { name: "Crispy Chicken Burger", price: 320, img: "https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?q=80&w=800" },
        ],
        "Healthy & Salads": [
            { name: "Greek Salad", price: 320, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800" },
            { name: "Avocado Toast", price: 250, img: "https://images.unsplash.com/photo-1588137372308-15f75323a675?q=80&w=800" },
        ],
        "Breakfast": [
            { name: "Full English Breakfast", price: 450, img: "https://images.unsplash.com/photo-1533089862017-5f2694158bdd?q=80&w=800" },
            { name: "Pancakes Stack", price: 320, img: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=800" },
        ],
        "Desserts": [
            { name: "Gulab Jamun", price: 150, img: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800" },
            { name: "Chocolate Cake", price: 180, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800" },
        ],
        "Naan": [
            { name: "Butter Naan", price: 60, img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=800" },
            { name: "Garlic Naan", price: 80, img: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e0?q=80&w=800" },
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
                    image: m.img, // Now using the actual image URL
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
