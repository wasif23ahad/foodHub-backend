import "dotenv/config";
import prisma from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

async function main() {
    console.log("🌱 Starting comprehensive seed...");

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

    // 2. Ensure Categories
    const categoryList = [
        "Deshi", "Biriyani", "Kababs", "Italian", "Pizza", "Asian", "Burgers",
        "Fast Food", "Healthy", "Salads", "Breakfast", "Desserts", "Naan"
    ];
    const categoryMap = new Map<string, string>();

    for (const name of categoryList) {
        const cat = await prisma.category.upsert({
            where: { name },
            update: {},
            create: { name, description: `Authentic ${name} dishes and flavors.` }
        });
        categoryMap.set(name, cat.id);
    }
    console.log(`✅ ${categoryList.length} categories ensured.`);

    // 3. Create 30+ Providers
    const providersToSeed = [
        { name: "Old Dhaka Kitchen", cuisine: "Deshi", desc: "Specializes in authentic Old Dhaka Tehari and Biriyani.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
        { name: "Sylhet Spice House", cuisine: "Deshi", desc: "Authentic Sylheti flavors including Shatkora curry.", img: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98" },
        { name: "Chittagong Mezban Haat", cuisine: "Deshi", desc: "Traditional Chittagonian Mezban beef experts.", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950" },
        { name: "The Pizza Press", cuisine: "Pizza", desc: "Hand-tossed artisanal pizzas with fresh toppings.", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002" },
        { name: "Burger Bastion", cuisine: "Burgers", desc: "Gourmet beef and chicken burgers.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" },
        { name: "Asian Fusion", cuisine: "Asian", desc: "A blend of Sushi, Ramen, and Thai favorites.", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624" },
        { name: "Healthy Harvest", cuisine: "Healthy", desc: "Nutrient-rich salads and quinoa bowls.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
        { name: "Morning Dew Cafe", cuisine: "Breakfast", desc: "Start your day with our signature breakfast platters.", img: "https://images.unsplash.com/photo-1533089862017-a0db5d742961" },
        { name: "Sweet Tooth Delights", cuisine: "Desserts", desc: "Traditional and modern sweets/cakes.", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
        { name: "Kabab Kingdom", cuisine: "Kababs", desc: "The ultimate destination for grilled meat lovers.", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0" },
        { name: "Naan Stop", cuisine: "Naan", desc: "Freshly baked tandoori breads of all kinds.", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be" },
        { name: "The Pasta Parlor", cuisine: "Italian", desc: "Creamy and authentic Italian pasta dishes.", img: "https://images.unsplash.com/photo-1612874742237-6526221588e3" },
        { name: "Deshi Tadka", cuisine: "Deshi", desc: "Daily home-cooked Bengali meals.", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950" },
        { name: "Coastal Catch", cuisine: "Deshi", desc: "Fresh seafood delicacies from the Bay of Bengal.", img: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98" },
        { name: "Dhaka Dhaba", cuisine: "Fast Food", desc: "Popular street foods like Fuchka and Chotpoti.", img: "https://images.unsplash.com/photo-1550547660-d9450f859349" },
        { name: "Green Leaf Vegan", cuisine: "Healthy", desc: "100% plant-based healthy meals.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
        { name: "Sultanic Biriyani", cuisine: "Biriyani", desc: "Premium Kacchi Biriyani specialists.", img: "https://images.unsplash.com/photo-1642821373181-696a54913e93" },
        { name: "Mughal Empire", cuisine: "Deshi", desc: "Rich royal flavors from the Mughal era.", img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46" },
        { name: "Grill & Chill", cuisine: "Kababs", desc: "Perfectly grilled BBQ and Tandoori.", img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0" },
        { name: "The Dessert Bar", cuisine: "Desserts", desc: "Cakes, pastries, and premium ice creams.", img: "https://images.unsplash.com/photo-1524351199678-c41985b90ec2" },
        { name: "Noodle Nest", cuisine: "Asian", desc: "Expertly prepared Pad Thai and Ramen.", img: "https://images.unsplash.com/photo-1559314809-0d155014e29e" },
        { name: "Steak House Elite", cuisine: "Burgers", desc: "Premium cuts and juicy burgers.", img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5" },
        { name: "Organic Orchard", cuisine: "Healthy", desc: "Fresh fruit bowls and organic snacks.", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe" },
        { name: "Bake Master", cuisine: "Naan", desc: "Aromatic and soft tandoori breads.", img: "https://images.unsplash.com/photo-1626074353765-517a681e40be" },
        { name: "Curry Corner", cuisine: "Deshi", desc: "Quick and spicy daily curry bowls.", img: "https://images.unsplash.com/photo-1601050690597-df0568f70950" },
        { name: "Village Flavors", cuisine: "Deshi", desc: "Traditional rural Bengali cuisine.", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
        { name: "The Soup Spoon", cuisine: "Asian", desc: "Comforting soups and appetizers.", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624" },
        { name: "Prawn Paradise", cuisine: "Deshi", desc: "Specialists in prawn and shrimp dishes.", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8" },
        { name: "Royal Rezala", cuisine: "Deshi", desc: "Focused on premium Mutton and Beef Rezala.", img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46" },
        { name: "Elite Sweets", cuisine: "Desserts", desc: "High-end Bengali sweets and desserts.", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587" },
        { name: "Bhorta Bary", cuisine: "Deshi", desc: "Authentic Bengali mashed delicacies (Bhortas).", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd" },
    ];

    const providerProfiles = [];

    for (const p of providersToSeed) {
        // Strip special characters like '&' and spaces, then lowercase
        const safeName = p.name.toLowerCase().replace(/[^a-z.\s]/g, "").replace(/\s+/g, ".");
        const email = `${safeName}@foodhub.com`;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            try {
                const result = await auth.api.signUpEmail({
                    body: { email, password: "password123", name: p.name },
                });
                if (result.user) {
                    user = await prisma.user.update({
                        where: { id: result.user.id },
                        data: { role: "PROVIDER", emailVerified: true }
                    });
                }
            } catch (e) {
                console.error(`Failed to create provider user ${p.name}:`, e);
                continue;
            }
        }

        if (user) {
            const profile = await prisma.providerProfile.upsert({
                where: { userId: user.id },
                update: {
                    businessName: p.name,
                    description: p.desc,
                    logo: p.img,
                    cuisineType: p.cuisine,
                    isActive: true
                },
                create: {
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
    console.log(`✅ ${providerProfiles.length} provider profiles ensured.`);

    // 4. Create 50+ Meals
    const mealsToSeed = [
        // Deshi (High Priority)
        { name: "Beef Kala Bhuna", category: "Deshi", price: 450, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Slow-cooked tender beef with authentic spices." },
        { name: "Shorshe Ilish", category: "Deshi", price: 550, image: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98", description: "Hilsa fish cooked in a pungent mustard gravy." },
        { name: "Chingri Malai Curry", category: "Deshi", price: 650, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", description: "Creamy coconut milk prawn curry." },
        { name: "Mutton Rezala", category: "Deshi", price: 480, image: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46", description: "Rich, white mutton curry with yogurt and nuts." },
        { name: "Bhuna Khichuri", category: "Deshi", price: 320, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Aromatic rice and lentil mix with beef/mutton." },
        { name: "Morog Polao", category: "Deshi", price: 380, image: "https://images.unsplash.com/photo-1642821373181-696a54913e93", description: "Traditional chicken and aromatic rice dish." },
        { name: "Old Dhaka Tehari", category: "Deshi", price: 300, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", description: "Spicy beef tehari cooked with mustard oil." },
        { name: "Beef Bhuna", category: "Deshi", price: 350, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Thick, spicy beef gravy." },
        { name: "Rui Fish Curry", category: "Deshi", price: 280, image: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98", description: "Classic Bengali fish curry with potatoes." },
        { name: "Shutki Bhuna", category: "Deshi", price: 250, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Spicy dried fish delicacy." },
        { name: "Aloo Bhorta", category: "Deshi", price: 50, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Traditional mashed potatoes with mustard oil and chilies." },
        { name: "Baingan Bharta", category: "Deshi", price: 80, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Fire-roasted mashed eggplant." },
        { name: "Duck Bhuna", category: "Deshi", price: 550, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Spicy duck curry, a winter favorite." },
        { name: "Vegetable Labra", category: "Deshi", price: 120, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Mixed vegetable cooked in Bengali style." },
        { name: "Panta Ilish", category: "Deshi", price: 400, image: "https://images.unsplash.com/photo-1613292443284-8d10eff93b98", description: "Traditional Boishakhi meal." },
        { name: "Nihari with Kulcha", category: "Deshi", price: 350, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950", description: "Slow-cooked beef shank stew." },

        // Biriyani
        { name: "Mutton Kacchi Biriyani", category: "Biriyani", price: 550, image: "https://images.unsplash.com/photo-1642821373181-696a54913e93", description: "Raw mutton layered with basmati rice." },
        { name: "Chicken Biriyani", category: "Biriyani", price: 350, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", description: "Classic aromatic chicken biriyani." },
        { name: "Beef Biriyani", category: "Biriyani", price: 420, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8", description: "Flavorful beef and rice blend." },
        { name: "Vegetable Biriyani", category: "Biriyani", price: 250, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0", description: "Fragrant rice with mixed vegetables." },

        // Kababs
        { name: "Seekh Kabab", category: "Kababs", price: 280, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Minced meat skewers grilled to perfection." },
        { name: "Chicken Tikka", category: "Kababs", price: 250, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Spiced and grilled chicken chunks." },
        { name: "Reshmi Kabab", category: "Kababs", price: 300, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398", description: "Creamy and soft chicken kababs." },
        { name: "Shami Kabab", category: "Kababs", price: 200, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Fried lentil and meat patties." },
        { name: "Boti Kabab", category: "Kababs", price: 320, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Marinated grilled meat pieces." },
        { name: "Tandoori Chicken", category: "Kababs", price: 350, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0", description: "Whole chicken marinated and grilled." },

        // Italian & Pizza
        { name: "Margherita Pizza", category: "Pizza", price: 650, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002", description: "Classic tomato and mozzarella." },
        { name: "Pepperoni Feast", category: "Pizza", price: 850, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e", description: "Loaded with spicy pepperoni." },
        { name: "Pasta Carbonara", category: "Italian", price: 450, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3", description: "Creamy Italian pasta." },
        { name: "Lasagna", category: "Italian", price: 750, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3", description: "Layered pasta with meat sauce and cheese." },
        { name: "BBQ Chicken Pizza", category: "Pizza", price: 800, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e", description: "Smoky chicken with BBQ sauce." },

        // Burgers & Fast Food
        { name: "Classic Cheeseburger", category: "Burgers", price: 350, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", description: "Juicy beef patty with cheddar." },
        { name: "Double Bacon Burger", category: "Burgers", price: 450, image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5", description: "For the ultimate meat lover." },
        { name: "Crispy Chicken Burger", category: "Burgers", price: 320, image: "https://images.unsplash.com/photo-1550547660-d9450f859349", description: "Crunchy fried chicken fillet." },
        { name: "Chicken Nuggets", category: "Fast Food", price: 250, image: "https://images.unsplash.com/photo-1550547660-d9450f859349", description: "Crispy bite-sized chicken (10pcs)." },
        { name: "French Fries", category: "Fast Food", price: 150, image: "https://images.unsplash.com/photo-1550547660-d9450f859349", description: "Golden and crispy large portion." },

        // Asian
        { name: "Ramen Bowl", category: "Asian", price: 450, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624", description: "Authentic miso ramen with toppings." },
        { name: "Sushi Platter", category: "Asian", price: 1200, image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c", description: "Assorted fresh sushi rolls." },
        { name: "Pad Thai", category: "Asian", price: 420, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e", description: "Classic Thai stir-fried noodles." },
        { name: "Kung Pao Chicken", category: "Asian", price: 400, image: "https://images.unsplash.com/photo-1559314809-0d155014e29e", description: "Spicy Szechuan style chicken." },
        { name: "Dim Sum Platter", category: "Asian", price: 500, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624", description: "Variety of steamed dumplings." },

        // Healthy & Salads
        { name: "Quinoa Salad Bowl", category: "Healthy", price: 350, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd", description: "Nutrient-rich greens and quinoa." },
        { name: "Caesar Salad", category: "Salads", price: 300, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1", description: "Classic romaine with caesar dressing." },
        { name: "Greek Salad", category: "Salads", price: 320, image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe", description: "Feta, olives, and fresh cucumber." },
        { name: "Avocado Toast", category: "Healthy", price: 250, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d", description: "Modern healthy breakfast choice." },

        // Breakfast
        { name: "Full English Breakfast", category: "Breakfast", price: 450, image: "https://images.unsplash.com/photo-1533089862017-a0db5d742961", description: "Eggs, beans, sausages, and more." },
        { name: "Pancakes Stack", category: "Breakfast", price: 320, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445", description: "Fluffy pancakes with syrup." },

        // Desserts
        { name: "Gulab Jamun", category: "Desserts", price: 150, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", description: "Sweet milk-based balls in syrup (4pcs)." },
        { name: "Rasmalai", category: "Desserts", price: 200, image: "https://images.unsplash.com/photo-1524351199678-c41985b90ec2", description: "Soft paneer balls in thickened sweet milk." },
        { name: "Kulfi", category: "Desserts", price: 100, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb", description: "Traditional frozen dairy dessert." },
        { name: "Chocolate Cake", category: "Desserts", price: 180, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587", description: "Decadent chocolate dessert." },
        { name: "Cheesecake", category: "Desserts", price: 250, image: "https://images.unsplash.com/photo-1524351199678-c41985b90ec2", description: "Creamy New York style cheesecake." },

        // Naan
        { name: "Butter Naan", category: "Naan", price: 60, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Soft flatbread with butter." },
        { name: "Garlic Naan", category: "Naan", price: 80, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Naan topped with aromatic garlic." },
        { name: "Cheese Naan", category: "Naan", price: 100, image: "https://images.unsplash.com/photo-1626074353765-517a681e40be", description: "Naan stuffed with gooey cheese." }
    ];

    let mealsCreated = 0;
    for (const meal of mealsToSeed) {
        const catId = categoryMap.get(meal.category);
        if (!catId) continue;

        // Try to find a provider that matches the cuisine type, or pick one randomly
        let matchedProvider = providerProfiles.find(p => p.cuisineType === meal.category);
        if (!matchedProvider) {
            // Fallbacks for general categories
            if (meal.category === "Pizza" || meal.category === "Italian") {
                matchedProvider = providerProfiles.find(p => p.cuisineType === "Italian" || p.cuisineType === "Pizza");
            } else if (meal.category === "Biriyani" || meal.category === "Kababs") {
                matchedProvider = providerProfiles.find(p => p.cuisineType === "Deshi" || p.cuisineType === "Biriyani" || p.cuisineType === "Kababs");
            }
        }

        // If still no match, pick a random provider
        const finalProvider = matchedProvider || providerProfiles[Math.floor(Math.random() * providerProfiles.length)];

        if (!finalProvider) continue;

        const existingMeal = await prisma.meal.findFirst({
            where: { name: meal.name, providerProfileId: finalProvider.id }
        });

        if (!existingMeal) {
            await prisma.meal.create({
                data: {
                    name: meal.name,
                    description: meal.description,
                    price: meal.price,
                    image: meal.image,
                    categoryId: catId,
                    providerProfileId: finalProvider.id,
                    isAvailable: true,
                    preparationTime: 20
                }
            });
            mealsCreated++;
        }
    }
    console.log(`✅ ${mealsCreated} new meals seeded.`);

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
