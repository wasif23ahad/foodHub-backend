import { Router } from "express";
import * as mealController from "../controllers/meal.controller";
import * as reviewController from "../controllers/review.controller";
import { validateQuery, validateParams } from "../middlewares";
import { mealQuerySchema, mealIdParamSchema } from "../validations/meal.validation";
import { reviewQuerySchema, mealIdParamSchema as reviewMealIdParamSchema } from "../validations/review.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// PUBLIC MEAL ROUTES
// /api/meals/*
// ═══════════════════════════════════════════════════════════
// Get all meals with filters (Public)
router.get("/", validateQuery(mealQuerySchema), mealController.getMeals);
// Get meal by ID (Public)
router.get("/:id", validateParams(mealIdParamSchema), mealController.getMealById);
// Get reviews for a specific meal (Public)
router.get("/:mealId/reviews", validateParams(reviewMealIdParamSchema), validateQuery(reviewQuerySchema), reviewController.getMealReviews);
export default router;
//# sourceMappingURL=meal.routes.js.map