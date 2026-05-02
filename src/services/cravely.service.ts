import { PrismaClient } from "@prisma/client";
import { geminiModel } from "../lib/ai";
import { AIService } from "./ai.service";

const prisma = new PrismaClient();

export class CravelyService {
  /**
   * Main chat interface for Cravely AI
   */
  static async chat(sessionId: string, message: string, userId?: string) {
    // 1. Semantic Retrieval (RAG)
    let suggestions: any[] = [];
    let context = "";

    try {
      // Find relevant meals based on the user's message
      suggestions = await AIService.getSearchSuggestions(message, 3);
      
      // 2. Build Context String
      if (suggestions.length > 0) {
        context = "Here are some relevant meals from our menu that might help you answer:\n";
        for (const s of suggestions) {
          const meal = await prisma.meal.findUnique({
            where: { id: s.id },
            include: { category: true, providerProfile: true }
          });
          if (meal) {
            context += `- ${meal.name}: ${meal.description}. Price: ৳${meal.price}. Category: ${meal.category.name}. From: ${meal.providerProfile.businessName}\n`;
          }
        }
      }
    } catch (err) {
      console.warn("⚠️ AI RAG Failed (falling back to general response):", err);
      // Proceed without context
    }

    // 3. System Prompt
    const systemPrompt = `
      You are Cravely, the premium AI food assistant for FoodHub. 
      Your goal is to help users find the perfect meal, explain FoodHub features, and provide a delightful conversational experience.
      
      Guidelines:
      - Be professional, witty, and food-obsessed.
      - Use the provided context to recommend specific meals.
      - If no context is relevant, answer generally about food and FoodHub.
      - Never invent meals that are not in the context.
      - Always mention prices in ৳ (BDT).
      
      ${context}
    `;

    // 4. Get Chat History
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 10
    });

    const chatHistory = history.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // 5. Call Gemini
    const chat = geminiModel.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    // 6. Persist Messages
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: message
      }
    });

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: responseText,
        citations: JSON.stringify(suggestions.map(s => s.id))
      }
    });

    return {
        message: responseText,
        citations: suggestions
    };
  }

  /**
   * Create or find a chat session
   */
  static async getOrCreateSession(sessionId?: string, userId?: string) {
    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true }
      });
      if (session) return session;
    }

    const data: any = {};
    if (userId) data.userId = userId;

    return prisma.chatSession.create({
      data
    });
  }
}
