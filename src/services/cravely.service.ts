import { PrismaClient } from "@prisma/client";
import { geminiModel } from "../lib/ai";
import { AIService } from "./ai.service";

const prisma = new PrismaClient();

export class CravelyService {
  /**
   * Main chat interface for Cravely AI
   */
  static async chat(sessionId: string, message: string, userId?: string) {
    try {
      // 1. Semantic Retrieval (RAG)
      let suggestions: any[] = [];
      let context = "";

      try {
        suggestions = await AIService.getSearchSuggestions(message, 3);
        
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
      } catch (ragErr) {
        console.warn("⚠️ AI RAG Failed:", ragErr);
        // Continue with empty context
      }

      // 2. System Prompt
      const systemPrompt = `
        You are Cravely, the premium AI food assistant for FoodHub. 
        Your goal is to help users find the perfect meal and explain FoodHub features.
        
        Guidelines:
        - Be professional, witty, and food-obsessed.
        - Use context to recommend specific meals.
        - Mention prices in ৳ (BDT).
        
        ${context}
      `;

      // 3. Get Chat History
      const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        take: 8
      });

      const chatHistory = history.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // 4. Call Gemini
      let responseText = "";
      try {
        const chat = geminiModel.startChat({
          history: chatHistory,
          systemInstruction: systemPrompt
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
      } catch (geminiErr: any) {
        console.error("❌ Gemini API Error:", geminiErr);
        if (geminiErr.message?.includes("401") || geminiErr.message?.includes("403")) {
          responseText = "I'm currently in a deep culinary meditation (API authentication issue). Please ask my human creators to check my Google AI keys!";
        } else {
          responseText = "My culinary circuits are a bit overloaded right now. Can you try asking me again in a moment?";
        }
      }

      // 5. Persist Messages
      try {
        await prisma.chatMessage.create({
          data: { sessionId, role: "user", content: message }
        });

        await prisma.chatMessage.create({
          data: {
            sessionId,
            role: "assistant",
            content: responseText,
            citations: JSON.stringify(suggestions.map(s => s.id))
          }
        });
      } catch (dbErr) {
        console.error("❌ Failed to persist chat:", dbErr);
      }

      return {
          message: responseText,
          citations: suggestions
      };
    } catch (globalErr) {
      console.error("❌ Global Cravely Service Error:", globalErr);
      return {
        message: "I've encountered an unexpected recipe error. Let's try starting our conversation over!",
        citations: []
      };
    }
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
