import { PrismaClient } from "@prisma/client";
import { generateEmbedding, vectorToBuffer } from "../src/lib/ai/index";
import crypto from "crypto";

const prisma = new PrismaClient();

async function backfill() {
  console.log("🚀 Starting meal embedding backfill...");
  
  const meals = await prisma.meal.findMany({
    include: {
      category: true,
      providerProfile: true,
    }
  });

  console.log(`🔍 Found ${meals.length} meals to process.`);

  for (const meal of meals) {
    try {
      // Create a descriptive string for embedding
      const content = `${meal.name}. ${meal.description}. Category: ${meal.category.name}. Provider: ${meal.providerProfile.businessName}`;
      const textHash = crypto.createHash("md5").update(content).digest("hex");

      console.log(`✨ Generating embedding for: ${meal.name}`);
      const embedding = await generateEmbedding(content);
      const buffer = vectorToBuffer(embedding);

      // Upsert into MealEmbedding table
      await prisma.mealEmbedding.upsert({
        where: { mealId: meal.id },
        update: { 
          embedding: buffer,
          textHash: textHash
        },
        create: {
          mealId: meal.id,
          embedding: buffer,
          textHash: textHash
        }
      });
      
      // Artificial delay to respect HF free tier rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to process meal ${meal.id}:`, error);
    }
  }

  console.log("✅ Backfill complete!");
  await prisma.$disconnect();
}

backfill();
