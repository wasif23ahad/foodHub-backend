import { PrismaClient } from "@prisma/client";
import { generateEmbedding, bufferToVector, cosineSimilarity } from "../lib/ai";

const prisma = new PrismaClient();

export class AIService {
  /**
   * Finds meals similar to a given meal ID
   */
  static async getRelatedMeals(mealId: string, limit: number = 5) {
    // 1. Get the target meal's embedding
    const targetEmbedding = await prisma.mealEmbedding.findUnique({
      where: { mealId }
    });

    if (!targetEmbedding) return [];

    const targetVector = bufferToVector(targetEmbedding.embedding as Buffer);

    // 2. Get all other meal embeddings
    const allEmbeddings = await prisma.mealEmbedding.findMany({
      where: { mealId: { not: mealId } },
      include: {
        meal: {
          include: {
            category: true,
            providerProfile: true,
          }
        }
      }
    });

    // 3. Calculate similarities
    const scoredMeals = allEmbeddings.map(emb => {
      const vector = bufferToVector(emb.embedding as Buffer);
      const similarity = cosineSimilarity(targetVector, vector);
      return {
        ...emb.meal,
        similarity
      };
    });

    // 4. Sort and return top results
    return scoredMeals
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Personalized recommendations based on user's order history
   */
  static async getPersonalizedRecommendations(userId: string, limit: number = 5) {
    // 1. Get user's last delivered orders to understand preferences
    const lastOrders = await prisma.order.findMany({
      where: { customerId: userId, status: "DELIVERED" },
      include: {
        orderItems: {
          include: {
            meal: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });

    if (lastOrders.length === 0) {
      // Fallback: Return top rated meals if no history
      return prisma.meal.findMany({
        take: limit,
        orderBy: { avgRating: "desc" },
        include: { category: true, providerProfile: true }
      });
    }

    // 2. Extract meal IDs from history
    const historyMealIds = lastOrders.flatMap(o => o.orderItems.map(i => i.mealId));
    
    // 3. Get embeddings for history meals
    const historyEmbeddings = await prisma.mealEmbedding.findMany({
      where: { mealId: { in: historyMealIds } }
    });

    if (historyEmbeddings.length === 0) {
      return prisma.meal.findMany({
        take: limit,
        orderBy: { avgRating: "desc" },
        include: { category: true, providerProfile: true }
      });
    }

    // 4. Create an "average preference vector"
    const vectors = historyEmbeddings.map(emb => bufferToVector(emb.embedding as Buffer));
    const vectorLength = vectors[0].length;
    const averageVector: number[] = new Array(vectorLength).fill(0);
    
    for (const vector of vectors) {
      for (let i = 0; i < vectorLength; i++) {
        averageVector[i] += (vector[i] || 0);
      }
    }
    
    for (let i = 0; i < vectorLength; i++) {
      averageVector[i] /= vectors.length;
    }

    // 5. Compare against all meals (excluding already ordered)
    const allEmbeddings = await prisma.mealEmbedding.findMany({
      where: { mealId: { notIn: historyMealIds } },
      include: {
        meal: {
          include: {
            category: true,
            providerProfile: true,
          }
        }
      }
    });

    const scoredMeals = allEmbeddings.map(emb => {
      const vector = bufferToVector(emb.embedding as Buffer);
      const similarity = cosineSimilarity(averageVector, vector);
      return {
        ...emb.meal,
        similarity
      };
    });

    return scoredMeals
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Search suggestions using a hybrid approach (Keyword + Semantic)
   */
  static async getSearchSuggestions(query: string, limit: number = 5) {
    try {
      // 1. Fast Keyword Search (Fallback/Parallel)
      const keywordMatches = await prisma.meal.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        take: limit,
      });

      // 2. Try Semantic Search (if embedding generation works)
      let semanticMatches: any[] = [];
      try {
        const queryEmbedding = await generateEmbedding(query);
        const allEmbeddings = await prisma.mealEmbedding.findMany({
          include: { meal: true }
        });

        semanticMatches = allEmbeddings.map(emb => {
          const vector = bufferToVector(emb.embedding as Buffer);
          const similarity = cosineSimilarity(queryEmbedding, vector);
          return {
            id: emb.meal.id,
            name: emb.meal.name,
            similarity
          };
        })
        .filter(s => s.similarity > 0.4) // Threshold
        .sort((a, b) => b.similarity - a.similarity);
      } catch (err) {
        console.warn("Semantic search failed, falling back to keyword matches:", err);
      }

      // 3. Merge and Deduplicate
      const combined = [...semanticMatches];
      
      // Add keyword matches if they aren't already in semantic results
      for (const km of keywordMatches) {
        if (!combined.some(s => s.id === km.id)) {
          combined.push({
            id: km.id,
            name: km.name,
            similarity: 1.0 // High priority for exact keyword matches
          });
        }
      }

      return combined.slice(0, limit);
    } catch (error) {
      console.error("Search suggestions fatal error:", error);
      return [];
    }
  }
}
