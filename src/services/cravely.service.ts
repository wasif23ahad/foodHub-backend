import { PrismaClient, Prisma } from "@prisma/client";
import { geminiModel, nvidiaClient } from "../lib/ai";
import { config } from "../config";
import { AIService } from "./ai.service";

const prisma = new PrismaClient();

type CitationMeal = {
  id: string;
  name: string;
  price: number;
  rating: number;
  category: string;
  provider: string;
  description: string;
};

type ChatResult = {
  message: string;
  citations: string[];
  provider: "nvidia" | "gemini" | "local";
  model: string;
  latencyMs: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

const SYSTEM_PROMPT = `You are Cravely, the friendly AI assistant for FoodHub.
You help customers discover meals that match cravings, budget, and dietary needs.

Rules:
- ONLY recommend meals present in the provided context.
- Mention a meal with <cite id="MEAL_ID"/> immediately after its name.
- If no context meal matches, say so honestly and suggest browsing FoodHub.
- Keep responses short, warm, and useful.
- You cannot place orders; tell users to add meals to cart and checkout.
- Redirect off-topic requests back to food.`;

function isConfigured(value?: string) {
  return !!value && value.length > 12 && !value.includes("YOUR_");
}

function validateCitations(text: string, allowedIds: string[]) {
  const allowed = new Set(allowedIds);
  const citations = new Set<string>();
  const cleaned = text.replace(/<cite\s+id=["']([^"']+)["']\s*\/?>/g, (match, id: string) => {
    if (!allowed.has(id)) return "";
    citations.add(id);
    return match;
  });

  return { content: cleaned.trim(), citations: Array.from(citations) };
}

function localGroundedResponse(message: string, meals: CitationMeal[]) {
  if (meals.length === 0) {
    return "I could not find a matching meal in FoodHub right now. Try browsing the meals page or search with a different craving.";
  }

  const budgetMatch = message.match(/(?:under|below|less than|within)\s*(\d+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;
  const filtered = budget ? meals.filter((meal) => meal.price <= budget) : meals;
  const picks = (filtered.length > 0 ? filtered : meals).slice(0, 3);

  return picks
    .map((meal) => `${meal.name} <cite id="${meal.id}"/> is ${meal.category.toLowerCase()} from ${meal.provider} for BDT ${meal.price}.`)
    .join(" ");
}

export class CravelyService {
  static checkRateLimit(key: string) {
    const now = Date.now();
    const existing = rateLimit.get(key);

    if (!existing || existing.resetAt <= now) {
      rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    }

    if (existing.count >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }

    existing.count += 1;
    return { allowed: true, remaining: RATE_LIMIT_MAX - existing.count, resetAt: existing.resetAt };
  }

  static async getContextMeals(message: string, limit = 8): Promise<CitationMeal[]> {
    const suggestions = await AIService.getSearchSuggestions(message, limit).catch(() => []);
    const ids = suggestions.map((suggestion) => suggestion.id);

    if (ids.length === 0) {
      const trending = await AIService.getTrendingMeals(limit);
      return trending.map((meal) => ({
        id: meal.id,
        name: meal.name,
        price: meal.price,
        rating: meal.avgRating || 0,
        category: meal.category?.name || "Meal",
        provider: meal.providerProfile?.businessName || "FoodHub",
        description: meal.description || "Freshly prepared FoodHub meal",
      }));
    }

    const meals = await prisma.meal.findMany({
      where: { id: { in: ids }, isAvailable: true },
      include: { category: true, providerProfile: true },
    });

    const order = new Map(ids.map((id, index) => [id, index]));
    return meals
      .sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999))
      .map((meal) => ({
        id: meal.id,
        name: meal.name,
        price: meal.price,
        rating: meal.avgRating || 0,
        category: meal.category?.name || "Meal",
        provider: meal.providerProfile?.businessName || "FoodHub",
        description: meal.description || "Freshly prepared FoodHub meal",
      }));
  }

  static async chat(sessionId: string, message: string, userId?: string): Promise<ChatResult> {
    const startedAt = Date.now();
    const contextMeals = await this.getContextMeals(message);
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const context = JSON.stringify(contextMeals, null, 2);
    const prompt = `${SYSTEM_PROMPT}

<context>
${context}
</context>

<chat_history>
${history.map((item) => `${item.role}: ${item.content}`).join("\n")}
</chat_history>

<user_message>
${message}
</user_message>`;

    let provider: ChatResult["provider"] = "local";
    let model = "local-grounded";
    let responseText = "";
    const providerPref = config.cravelyProvider.toLowerCase();

    if ((providerPref === "auto" || providerPref === "nvidia") && isConfigured(process.env["NVIDIA_API_KEY"])) {
      try {
        const completion = await nvidiaClient.chat.completions.create({
          model: config.cravelyNvidiaModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 600,
        });
        responseText = completion.choices?.[0]?.message?.content ?? "";
        provider = "nvidia";
        model = config.cravelyNvidiaModel;
      } catch (error) {
        console.error("NVIDIA chat failed:", error);
      }
    }

    if (!responseText && (providerPref === "auto" || providerPref === "gemini") && isConfigured(process.env["GOOGLE_AI_API_KEY"])) {
      try {
        const result = await geminiModel.generateContent(prompt);
        responseText = result.response.text();
        provider = "gemini";
        model = config.cravelyGeminiModel;
      } catch (error) {
        console.error("Gemini chat failed:", error);
      }
    }

    if (!responseText) {
      responseText = localGroundedResponse(message, contextMeals);
    }

    const validated = validateCitations(responseText, contextMeals.map((meal) => meal.id));
    const finalText = validated.content || localGroundedResponse(message, contextMeals);
    const latencyMs = Date.now() - startedAt;

    await prisma.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: finalText,
        citations: validated.citations as Prisma.InputJsonValue,
      },
    });

    return {
      message: finalText,
      citations: validated.citations,
      provider,
      model,
      latencyMs,
    };
  }

  static async getOrCreateSession(sessionId?: string, userId?: string) {
    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true },
      });
      if (session) return session;
    }

    return prisma.chatSession.create({
      data: userId ? { userId } : {},
    });
  }
}
