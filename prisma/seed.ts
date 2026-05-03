import "dotenv/config";
import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { config } from "../src/config";
import type { providerProfile } from "@prisma/client";

async function ensureCredentialUser(email: string, password: string, name: string, role: "CUSTOMER" | "PROVIDER" | "ADMIN") {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            role,
            emailVerified: true,
            banned: false,
            banReason: null,
        },
        create: {
            email,
            name,
            role,
            emailVerified: true,
        },
    });

    // 2. Ensure only one credential account exists to avoid login conflicts
    await prisma.account.deleteMany({
        where: {
            userId: user.id,
            providerId: "credential",
        },
    });

    await prisma.account.create({
        data: {
            userId: user.id,
            providerId: "credential",
            accountId: email,
            password: hashedPassword,
        },
    });

    return user;
}

const auth = {
    api: {
        signUpEmail: async ({ body }: { body: { email: string; password: string; name: string } }) => ({
            user: await ensureCredentialUser(body.email, body.password, body.name, "CUSTOMER"),
        }),
    },
};

async function main() {
    await ensureCredentialUser("demo-customer@foodhub.app", "Demo@1234", "Demo Customer", "CUSTOMER");
    const demoProviderUser = await ensureCredentialUser("demo-provider@foodhub.app", "Demo@1234", "Demo Provider", "PROVIDER");
    await ensureCredentialUser("demo-admin@foodhub.app", "Demo@1234", "Demo Admin", "ADMIN");
    console.log("✅ Demo accounts created.");
    console.log("🌱 Starting final cleanup & seed (Local Images)...");

    // 1. Create Superadmin User
    await ensureCredentialUser(config.adminEmail, config.adminPassword, "FoodHub Admin", "ADMIN");
    console.log(`✅ Admin user ensured: ${config.adminEmail}`);

    // 2. Clear existing data
    console.log("🧹 Cleaning up old data types...");
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.providerProfile.deleteMany({});
    await prisma.category.deleteMany({});

    // 3. Ensure Categories (11)
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

    const providerProfiles: providerProfile[] = [];
    const demoProviderProfile = await prisma.providerProfile.create({
        data: {
            userId: demoProviderUser.id,
            businessName: "Demo Provider Kitchen",
            description: "Demo provider account for reviewing FoodHub provider workflows.",
            logo: "",
            cuisineType: "Deshi",
            isActive: true,
            address: "Demo Delivery Center",
            contactEmail: "demo-provider@foodhub.app",
        },
    });
    providerProfiles.push(demoProviderProfile);
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
    const mealDataMap: any = {
        "Deshi": [
            { name: "Beef Kala Bhuna", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/beef-kala-bhuna_zcdmpn.jpg", dietary: "HALAL" },
            { name: "Shorshe Ilish", price: 550, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667741/shorshe-ilish_vjrydc.jpg", dietary: "HALAL" },
            { name: "Chingri Malai Curry", price: 650, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667708/chingri-malai-curry_usndhl.jpg", dietary: "HALAL" },
            { name: "Mutton Rezala", price: 480, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667729/mutton-rezala_hdgupz.jpg", dietary: "HALAL" },
            { name: "Bhuna Khichuri", price: 320, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/bhuna-khichuri_yvxdjh.jpg", dietary: "VEGETARIAN" },
            { name: "Morog Polao", price: 380, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667728/morog-polao_ol9fho.jpg", dietary: "HALAL" },
            { name: "Old Dhaka Tehari", price: 300, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667730/old-dhaka-tehari_idt6dq.jpg", dietary: "HALAL" },
            { name: "Beef Bhuna", price: 350, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/beef-bhuna_fowjot.jpg", dietary: "HALAL" },
            { name: "Rui Fish Curry", price: 280, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667740/rui-fish-curry_xxsmk8.jpg", dietary: "HALAL" },
            { name: "Shutki Bhuna", price: 250, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667745/shutki-bhuna_hmye3v.jpg", dietary: "HALAL" },
            { name: "Aloo Bhorta", price: 50, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/aloo-bhorta_b4mvaw.jpg", dietary: "VEGAN" },
            { name: "Begun Bhorta", price: 80, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/begun-bhorta_dtalfi.jpg", dietary: "VEGAN" },
            { name: "Hash Bhuna", price: 550, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667719/hash-bhuna_tdvvtb.jpg", dietary: "HALAL" },
            { name: "Panta Ilish", price: 400, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667734/panta-ilish_vozfxk.jpg", dietary: "HALAL" },
            { name: "Vegetable Labra", price: 120, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667746/vegetable-labra_dblhst.jpg", dietary: "VEGAN" },
        ],
        "Nihari": [
            { name: "Nihari Special", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667730/nihari-special_sfcvw1.jpg", dietary: "HALAL" },
            { name: "Nalli Nihari", price: 550, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667729/nalli-nihari_ufuglm.jpg", dietary: "HALAL" },
        ],
        "Beverages": [
            { name: "Lacchi", price: 120, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667723/lacchi_q7jdov.jpg", dietary: "VEGETARIAN" },
            { name: "Badam Shorbot", price: 150, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/badam-shorbot_gvsro6.jpg", dietary: "VEGAN" },
            { name: "Jafrani Shorbot", price: 180, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667722/jafrani-shorbot_mdqtny.jpg", dietary: "VEGAN" },
        ],
        "Biriyani": [
            { name: "Kacchi Biriyani", price: 550, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667723/kacchi-biriyani_ilfmsu.jpg", dietary: "HALAL" },
            { name: "Chicken Biriyani", price: 350, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667707/chicken-biriyani_mtc9lo.jpg", dietary: "HALAL" },
            { name: "Beef Biriyani", price: 420, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/beef-biriyani_eovu7w.jpg", dietary: "HALAL" },
            { name: "Handi Biriyani", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667718/handi-biriyani_ul99mu.jpg", dietary: "HALAL" },
        ],
        "Kababs": [
            { name: "Sheek Kabab", price: 280, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667740/sheek-kabab_qxflln.jpg", dietary: "HALAL" },
            { name: "Chicken Tikka", price: 250, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667708/chicken-tikka_yzgjrt.jpg", dietary: "HALAL" },
            { name: "Reshmi Kabab", price: 300, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667739/reshmi-kabab_pbxinv.jpg", dietary: "HALAL" },
            { name: "Shami Kabab", price: 200, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667740/shami-kabab_qnlf5r.jpg", dietary: "HALAL" },
            { name: "Boti Kabab", price: 320, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/boti-kabab_li5l9s.jpg", dietary: "HALAL" },
            { name: "Tandoori Chicken", price: 350, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667746/tandoori-chicken_mdtrnv.jpg", dietary: "HALAL" },
            { name: "Grill Chicken", price: 380, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667718/grill-chicken_g86gix.jpg", dietary: "KETO" },
        ],
        "Pizza & Italian": [
            { name: "Margherita Pizza", price: 650, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667724/margherita-pizza_tr9zrt.jpg", dietary: "VEGETARIAN" },
            { name: "Pepperoni Feast", price: 850, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667735/pepperoni-feast_hv1aug.jpg", dietary: "REGULAR" },
            { name: "BBQ Chicken Pizza", price: 800, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/bbq-chicken-pizza_u2rxtc.jpg", dietary: "REGULAR" },
            { name: "Pasta Carbonara", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667734/pasta-carbonara_wizfid.jpg", dietary: "REGULAR" },
            { name: "Lasagna", price: 750, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667723/lasagna_pfbl8p.jpg", dietary: "REGULAR" },
        ],
        "Burgers & Fast Food": [
            { name: "Classic Cheeseburger", price: 350, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667708/classic-cheeseburger_kwzyjg.jpg", dietary: "REGULAR" },
            { name: "Double Bacon Burger", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667713/double-bacon-burger_bcbih3.jpg", dietary: "REGULAR" },
            { name: "Crispy Chicken Burger", price: 320, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667712/crispy-chicken-burger_zdtbvh.jpg", dietary: "HALAL" },
            { name: "Chicken Nuggets", price: 250, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667707/chicken-nuggets_i6gyil.jpg", dietary: "HALAL" },
            { name: "French Fries", price: 150, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667713/french-fries_snsp6g.jpg", dietary: "VEGAN" },
            { name: "Shingara", price: 20, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667740/shingara_nsapqb.jpg", dietary: "VEGETARIAN" },
        ],
        "Healthy & Salads": [
            { name: "Greek Salad", price: 320, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667717/greek-salad_bsmvai.jpg", dietary: "VEGETARIAN" },
            { name: "Avocado Toast", price: 250, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667702/avocado-toast_pybzrb.jpg", dietary: "VEGAN" },
        ],
        "Breakfast": [
            { name: "Full English Breakfast", price: 450, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667713/full-english-breakfast_j0fhlo.jpg", dietary: "REGULAR" },
            { name: "Pancakes Stack", price: 320, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667734/pancakes-stack_qhiby0.jpg", dietary: "VEGETARIAN" },
        ],
        "Desserts": [
            { name: "Gulab Jamun", price: 150, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667718/gulab-jamun_sjhjt4.jpg", dietary: "VEGETARIAN" },
            { name: "Rasmalai", price: 200, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667735/rasmalai_i3m51i.jpg", dietary: "VEGETARIAN" },
            { name: "Kulfi", price: 100, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667723/kulfi_afzuxi.jpg", dietary: "VEGETARIAN" },
            { name: "Chocolate Cake", price: 180, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667708/chocolate-cake_eozk21.jpg", dietary: "VEGETARIAN" },
            { name: "Cheesecake", price: 250, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/cheesecake_oyuzqa.jpg", dietary: "VEGETARIAN" },
        ],
        "Naan": [
            { name: "Butter Naan", price: 60, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667703/butter-naan_xgwfev.jpg", dietary: "VEGETARIAN" },
            { name: "Garlic Naan", price: 80, img: "https://res.cloudinary.com/dmvfa61je/image/upload/v1772667714/garlic-naan_mqtlva.jpg", dietary: "VEGAN" },
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
