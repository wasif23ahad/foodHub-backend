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

const SYSTEM_PROMPT = `You are Cravely, the friendly AI assistant for FoodHub — a Bangladeshi food ordering platform.
You help customers discover meals that match their cravings, budget, and dietary preferences.

## How to respond
- Talk in a friendly, helpful, and conversational tone.
- Use Markdown for emphasis (**bold** for meal names or key points, bullet lists for multiple items).
- Use citations for any meal you recommend from the context (see below).
- Emojis are fine, used sparingly. Food-related emojis like 🍛 🍕 🍔 ☕ are encouraged.
- Keep replies concise: 3-5 sentences usually.
- Mention prices in BDT format (e.g. "৳350" or "350 BDT").

## Recommending meals & Citations
When suggesting meals from the provided context:
- For EVERY meal you mention, you MUST include a citation tag immediately after its name.
- Format: <cite id="MEAL_ID"/>
- Example: "You should try the **Kacchi Biriyani** <cite id="meal-123"/> from Sultan's Dine! It's legendary and costs only ৳450."
- Naturally mention the provider (kitchen) name.
- Recommend at most 3-4 meals per reply.

## Constraints
- ONLY recommend meals present in the provided context. Never invent meals.
- If no matching meal exists, suggest browsing the full menu or try a different craving.
- Never claim to place orders for the user. Tell them to add to cart.`;

const BRIEF_SYSTEM_PROMPT = `You are Cravely, FoodHub's AI food assistant. Reply in 1-2 short, friendly sentences. Use Markdown for emphasis. Use <cite id="ID"/> for any meals. Emojis are fine.`;

const TRIVIAL_PATTERNS = [
  /^(hi|hello|hey|yo|hola|greetings|thanks|thank you|ok|okay|cool|nice|bye|goodbye)\b/i,
  /^how are you/i,
  /^what can you do/i,
  /^who are you/i,
];

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

export function sanitizeChunk(text: string): string {
  // Strip all tags EXCEPT <cite ... />
  // We match <cite ... /> and preserve it, while removing others
  return text.replace(/<\/?[a-z][^>]*>/gi, (match) => {
    if (match.toLowerCase().startsWith("<cite")) return match;
    return "";
  });
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
    const isTrivial = TRIVIAL_PATTERNS.some(re => re.test(message.trim()));

    let prompt: string;
    let contextMeals: CitationMeal[] = [];

    if (isTrivial) {
      prompt = `${BRIEF_SYSTEM_PROMPT}\n\nUser: ${message}`;
    } else {
      const [meals, history] = await Promise.all([
        this.getContextMeals(message),
        prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
          take: 8,
        }),
      ]);
      contextMeals = meals;

      const context = meals.map(m => 
        `- ${m.name} (${m.category}, ৳${m.price}, by ${m.provider}): ${m.description.slice(0, 100)}`
      ).join("\n");

      prompt = `${SYSTEM_PROMPT}

<context>
${context}
</context>

<chat_history>
${history.map((item) => `${item.role}: ${item.content}`).join("\n")}
</chat_history>

<user_message>
${message}
</user_message>`;
    }

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

  static async *chatStream(sessionId: string, message: string, userId?: string) {
    const isTrivial = TRIVIAL_PATTERNS.some(re => re.test(message.trim()));
    let contextMeals: CitationMeal[] = [];
    let prompt: string;

    if (isTrivial) {
      prompt = `${BRIEF_SYSTEM_PROMPT}\n\nUser: ${message}`;
    } else {
      const [meals, history] = await Promise.all([
        this.getContextMeals(message),
        prisma.chatMessage.findMany({
          where: { sessionId },
          orderBy: { createdAt: "asc" },
          take: 8,
        }),
      ]);
      contextMeals = meals;
      const context = meals.map(m => 
        `- ${m.name} (${m.category}, ৳${m.price}, by ${m.provider}): ${m.description.slice(0, 100)}`
      ).join("\n");

      prompt = `${SYSTEM_PROMPT}

<context>
${context}
</context>

<chat_history>
${history.map((item) => `${item.role}: ${item.content}`).join("\n")}
</chat_history>

<user_message>
${message}
</user_message>`;
    }

    const streamingResponse = await geminiModel.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 400,
        temperature: 0.4,
        topP: 0.9,
      },
    });

    let fullText = "";
    for await (const chunk of streamingResponse.stream) {
      const text = chunk.text();
      const cleaned = sanitizeChunk(text);
      if (cleaned) {
        fullText += cleaned;
        yield { type: "token", text: cleaned };
      }
    }

    const validated = validateCitations(fullText, contextMeals.map(m => m.id));
    
    // Background tasks: Save to DB
    Promise.all([
      prisma.chatMessage.create({
        data: { sessionId, role: "user", content: message },
      }),
      prisma.chatMessage.create({
        data: {
          sessionId,
          role: "assistant",
          content: validated.content,
          citations: validated.citations as Prisma.InputJsonValue,
        },
      })
    ]).catch(err => console.error("Failed to save chat to DB:", err));

    yield { 
      type: "done", 
      sessionId,
      citations: validated.citations,
      fullText: validated.content
    };
  }
}
