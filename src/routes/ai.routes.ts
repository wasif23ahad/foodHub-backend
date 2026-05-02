import { Router } from "express";
import { AIService } from "../services/ai.service";
import { CravelyService } from "../services/cravely.service";
import { requireAuth } from "../middlewares";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

/**
 * Recommendations
 */

// Get personalized recommendations
router.get("/recommendations/personalized", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    
    const recommendations = await AIService.getPersonalizedRecommendations(userId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Personalized recommendations failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get related meals
router.get("/recommendations/related/:mealId", async (req, res) => {
  try {
    const { mealId } = req.params;
    const recommendations = await AIService.getRelatedMeals(mealId);
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Related meals failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Semantic Search
 */

// Search suggestions
router.get("/search/suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      return res.json({ success: true, data: [] });
    }
    
    const suggestions = await AIService.getSearchSuggestions(q);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("Search suggestions failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * Cravely AI Chat
 */

// Main chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user?.id;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const session = await CravelyService.getOrCreateSession(sessionId, userId);
    const result = await CravelyService.chat(session.id, message, userId);
    
    res.json({ 
      success: true, 
      data: {
        sessionId: session.id,
        ...result
      } 
    });
  } catch (error) {
    console.error("Cravely chat failed:", error);
    res.status(500).json({ success: false, message: "AI Assistant is currently busy. Please try again." });
  }
});

// Get chat history
router.get("/chat/session/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: { 
        messages: {
          orderBy: { createdAt: "asc" }
        } 
      }
    });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load history" });
  }
});

export default router;
