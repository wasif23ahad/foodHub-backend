import { Router } from "express";
import type { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AIService } from "../services/ai.service";
import { CravelyService } from "../services/cravely.service";
import { requireAuth } from "../middlewares";

const router = Router();
const prisma = new PrismaClient();

function parseLimit(value: unknown, fallback: number, max = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function sendSse(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

router.get("/recommendations/personalized", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const recommendations = await AIService.getPersonalizedRecommendations(userId, parseLimit(req.query["limit"], 8));
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Personalized recommendations failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/recommendations", async (req, res) => {
  try {
    const context = ["home", "detail", "cart"].includes(req.body?.context) ? req.body.context as "home" | "detail" | "cart" : "home";
    const input: { userId?: string; limit?: number; context?: "home" | "detail" | "cart"; mealId?: string } = {
      context,
      limit: parseLimit(req.body?.limit, 8),
    };
    if (typeof req.user?.id === "string") input.userId = req.user.id;
    if (typeof req.body?.mealId === "string") input.mealId = req.body.mealId;

    const result = await AIService.getRecommendations(input);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Recommendations failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/recommendations/related/:mealId", async (req, res) => {
  try {
    const mealId = req.params["mealId"];
    if (!mealId) {
      return res.status(400).json({ success: false, message: "Meal ID is required" });
    }

    const recommendations = await AIService.getRelatedMeals(mealId, parseLimit(req.query["limit"], 5));
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Related meals failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/trending", async (req, res) => {
  try {
    const meals = await AIService.getTrendingMeals(
      parseLimit(req.query["limit"], 8),
      parseLimit(req.query["days"], 7, 90)
    );
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error("Trending meals failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get(["/suggest", "/search/suggestions"], async (req, res) => {
  try {
    const q = req.query["q"];
    if (!q || typeof q !== "string") {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await AIService.getSearchSuggestions(q, parseLimit(req.query["limit"], 5));
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("Search suggestions failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : undefined;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const userId = req.user?.id as string | undefined;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    if (message.length > 1000) {
      return res.status(400).json({ success: false, message: "Message must be 1000 characters or less" });
    }

    const limitKey = userId ?? sessionId ?? req.ip ?? "anonymous";
    const limit = CravelyService.checkRateLimit(limitKey);
    if (!limit.allowed) {
      return res.status(429).json({
        success: false,
        message: `You've hit your hourly chat limit. Resets in ${Math.ceil((limit.resetAt - Date.now()) / 60000)} min.`,
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const session = await CravelyService.getOrCreateSession(sessionId, userId);
    const result = await CravelyService.chat(session.id, message, userId);

    const chunks = result.message.match(/.{1,24}(\s|$)/g) ?? [result.message];
    for (const chunk of chunks) {
      sendSse(res, "token", { text: chunk });
    }

    sendSse(res, "citations", { meals: result.citations });
    sendSse(res, "done", {
      sessionId: session.id,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      remaining: limit.remaining,
    });
    res.end();
  } catch (error) {
    console.error("Cravely chat failed:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "AI Assistant is currently busy. Please try again." });
    }
    sendSse(res, "error", { message: "AI Assistant is currently busy. Please try again." });
    res.end();
  }
});

router.get("/chat/session/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    if (!id) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load history" });
  }
});

export default router;
