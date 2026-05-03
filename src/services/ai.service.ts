import { PrismaClient } from "@prisma/client";
import { generateEmbedding, bufferToVector, cosineSimilarity } from "../lib/ai";

const prisma = new PrismaClient();

type MealSuggestion = {
  id: string;
  name: string;
  image?: string | null;
  similarity: number;
};

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
    const firstVector = vectors[0];
    if (!firstVector) {
      return this.getTrendingMeals(limit);
    }

    const vectorLength = firstVector.length;
    const averageVector: number[] = new Array(vectorLength).fill(0);
    
    for (const vector of vectors) {
      for (let i = 0; i < vectorLength; i++) {
        averageVector[i] = (averageVector[i] ?? 0) + (vector[i] || 0);
      }
    }
    
    for (let i = 0; i < vectorLength; i++) {
      averageVector[i] = (averageVector[i] ?? 0) / vectors.length;
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
   * Cold-start fallback based on recent order volume and rating.
   */
  static async getTrendingMeals(limit: number = 8, days: number = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const meals = await prisma.meal.findMany({
      where: { isAvailable: true },
      include: {
        category: true,
        providerProfile: true,
        orderItems: {
          where: {
            order: {
              createdAt: { gte: since },
              status: { not: "CANCELLED" },
            },
          },
          select: { id: true },
        },
      },
    });

    return meals
      .map((meal) => ({
        ...meal,
        recentOrders: meal.orderItems.length,
        score: meal.orderItems.length * 2 + (meal.avgRating || 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  static async getRecommendations(input: {
    userId?: string;
    limit?: number;
    context?: "home" | "detail" | "cart";
    mealId?: string;
  }) {
    const limit = input.limit ?? 8;

    if (input.context === "detail" && input.mealId) {
      const data = await this.getRelatedMeals(input.mealId, limit);
      return { data, personalized: false, cacheHit: false };
    }

    if (input.userId) {
      const data = await this.getPersonalizedRecommendations(input.userId, limit);
      return { data, personalized: true, cacheHit: false };
    }

    const data = await this.getTrendingMeals(limit);
    return { data, personalized: false, cacheHit: false };
  }

  /**
   * Search suggestions using a professional hybrid approach (Keyword + Semantic)
   */
  static async getSearchSuggestions(query: string, limit: number = 8) {
    try {
      const normalizedQuery = query.trim().toLowerCase();
      if (normalizedQuery.length < 2) return [];

      // 1. Get Keyword Matches
      const keywordMatches = await prisma.meal.findMany({
        where: {
          OR: [
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { description: { contains: normalizedQuery, mode: "insensitive" } }
          ]
        },
        include: {
          category: true,
          providerProfile: true,
        },
        take: limit * 2,
      });

      const keywordIds = new Set(keywordMatches.map(m => m.id));

      // 2. Try Semantic Search
      let results: (MealSuggestion & { isKeywordMatch: boolean; score: number })[] = [];
      
      try {
        const queryEmbedding = await generateEmbedding(query);
        const allEmbeddings = await prisma.mealEmbedding.findMany({
          include: { 
            meal: {
              include: {
                category: true,
                providerProfile: true,
              }
            } 
          }
        });

        results = allEmbeddings.map(emb => {
          const vector = bufferToVector(emb.embedding as Buffer);
          const similarity = cosineSimilarity(queryEmbedding, vector);
          const isKeywordMatch = keywordIds.has(emb.meal.id);
          
          // Hybrid Scoring: Semantic similarity + Keyword Boost
          // If it matches keywords, we boost the semantic score
          let score = similarity;
          if (isKeywordMatch) {
            score = similarity * 1.3; // 30% boost for keyword matches
          }

          return {
            id: emb.meal.id,
            name: emb.meal.name,
            image: emb.meal.image,
            similarity: similarity,
            isKeywordMatch,
            score: score
          };
        })
        .filter(s => s.score > 0.45) // Professional threshold
        .sort((a, b) => b.score - a.score);

      } catch (err) {
        console.warn("⚠️ Semantic search failed, falling back to keyword matches only.");
        // Fallback to keyword only if semantic fails
        results = keywordMatches.map(m => ({
          id: m.id,
          name: m.name,
          image: m.image,
          similarity: 0,
          isKeywordMatch: true,
          score: 1.0
        }));
      }

      // 3. Add missing keyword matches that didn't have embeddings
      for (const km of keywordMatches) {
        if (!results.some(s => s.id === km.id)) {
          results.push({
            id: km.id,
            name: km.name,
            image: km.image,
            similarity: 0,
            isKeywordMatch: true,
            score: 0.8 // Decent score for keyword only
          });
        }
      }

      // 4. Final sort and return top results
      return results
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error("❌ Search suggestions fatal error:", error);
      return [];
    }
  }
}
