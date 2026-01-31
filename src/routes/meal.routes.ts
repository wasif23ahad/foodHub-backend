import { Router, IRouter } from "express";
import * as mealController from "../controllers/meal.controller";
import { requireAuth, requireProvider, validateBody, validateQuery, validateParams } from "../middlewares";
import { createMealSchema, updateMealSchema, mealQuerySchema, mealIdParamSchema } from "../validations/meal.validation";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// PUBLIC MEAL ROUTES
// /api/meals/*
// ═══════════════════════════════════════════════════════════

// Get all meals with filters (Public)
router.get(
    "/",
    validateQuery(mealQuerySchema),
    mealController.getMeals
);

// Get meal by ID (Public)
router.get(
    "/:id",
    validateParams(mealIdParamSchema),
    mealController.getMealById
);

export default router;
