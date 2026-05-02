import { PrismaClient } from "@prisma/client";
import { geminiModel, nvidiaClient } from "../lib/ai";
import { AIService } from "./ai.service";

const prisma = new PrismaClient();

export class CravelyService {
  /**
   * Fetch current weather for Bangladesh (Dhaka default)
   */
  private static async getWeather() {
    try {
      const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true");
      const data: any = await res.json();
      const code = data.current_weather?.weathercode;
      const temp = data.current_weather?.temperature;
      
      let condition = "Clear";
      if (code >= 1 && code <= 3) condition = "Partly Cloudy";
      if (code >= 45 && code <= 48) condition = "Foggy";
      if (code >= 51 && code <= 65) condition = "Rainy";
      if (code >= 80 && code <= 82) condition = "Showers";
      if (code === 95) condition = "Thunderstorm";

      return { condition, temp: `${temp}°C` };
    } catch (e) {
      return { condition: "Unknown", temp: "Unknown" };
    }
  }

  /**
   * Main chat interface for Cravely AI
   */
  static async chat(sessionId: string, message: string, userId?: string) {
    try {
      // 1. Get Context (RAG, Weather, Time)
      const [suggestions, weather] = await Promise.all([
        AIService.getSearchSuggestions(message, 3).catch(() => []),
        this.getWeather()
      ]);

      const bdTime = new Date(new Date().getTime() + (6 * 60 * 60 * 1000));
      const hours = bdTime.getUTCHours();
      let timeOfDay = "Day";
      if (hours < 12) timeOfDay = "Morning";
      if (hours >= 12 && hours < 17) timeOfDay = "Afternoon";
      if (hours >= 17 && hours < 21) timeOfDay = "Evening";
      if (hours >= 21 || hours < 5) timeOfDay = "Night";

      let context = "";
      if (suggestions.length > 0) {
        context = "Here are some relevant meals from our menu:\n";
        for (const s of suggestions) {
          const meal = await prisma.meal.findUnique({
            where: { id: s.id },
            include: { category: true, providerProfile: true }
          });
          if (meal) {
            context += `- ${meal.name}: ${meal.description}. Price: ৳${meal.price}. Category: ${meal.category.name}.\n`;
          }
        }
      }

      // 2. System Prompt
      const systemPrompt = `
        You are Cravely, the professional food concierge for FoodHub. 
        Current Context in Bangladesh:
        - Time: ${timeOfDay} (${bdTime.toLocaleTimeString()})
        - Weather: ${weather.condition}, ${weather.temp}
        
        Guidelines:
        - Provide helpful, clear, and professional recommendations.
        - Tailor suggestions to the current weather and time (e.g., comfort food for rain, light lunch for afternoon).
        - Use the provided menu context to recommend REAL meals.
        - Mention prices clearly in ৳ (BDT).
        - Maintain a refined, premium service tone.
      `;

      // 3. Get Chat History
      const history = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        take: 8
      });

      // 4. Call AI Provider
      let responseText = "";
      
      // Try NVIDIA StepFun model first if configured
      const nvidiaKey = process.env["NVIDIA_API_KEY"];
      const isNvidiaAvailable = nvidiaKey && 
                               nvidiaKey !== "YOUR_NVIDIA_API_KEY" && 
                               nvidiaKey.length > 20;

      if (isNvidiaAvailable) {
        try {
          const completion = await nvidiaClient.chat.completions.create({
            model: "stepfun-ai/step-3.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              ...history.map(m => ({ 
                role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user", 
                content: m.content 
              })),
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 500,
          });
          const choice = completion.choices?.[0];
          responseText = choice?.message?.content || (choice?.message as any)?.reasoning_content || "";
        } catch (nvidiaErr: any) {
          console.error("❌ NVIDIA API Error:", nvidiaErr);
          // Fallback will happen if responseText is empty
        }
      }

      // Fallback to Gemini if NVIDIA is not available or failed
      if (!responseText) {
        try {
          const chatHistory = history.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }));

          const chat = geminiModel.startChat({
            history: chatHistory
          });

          const fullMessage = `${systemPrompt}\n\nUser Message: ${message}`;
          const result = await chat.sendMessage(fullMessage);
          responseText = result.response.text();
        } catch (geminiErr: any) {
          console.error("❌ Gemini API Error:", geminiErr);
          if (geminiErr.message?.includes("401") || geminiErr.message?.includes("403")) {
            responseText = "I'm currently in a deep culinary meditation (API authentication issue). Please ask my human creators to check my Google AI keys!";
          } else {
            responseText = "My culinary circuits are a bit overloaded right now. Can you try asking me again in a moment?";
          }
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
