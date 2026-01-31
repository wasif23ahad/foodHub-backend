import { Router, IRouter } from "express";
import * as providerController from "../controllers/provider.controller";
import * as mealController from "../controllers/meal.controller";
import { requireAuth, requireProvider, validateBody, validateParams } from "../middlewares";
import {
    createProviderProfileSchema,
    updateProviderProfileSchema,
} from "../validations/provider.validation";
import { createMealSchema, updateMealSchema, mealIdParamSchema } from "../validations/meal.validation";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// PROVIDER ROUTES
// /api/provider/*
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────────────────────

router.get(
    "/profile",
    requireAuth,
    requireProvider,
    providerController.getMyProfile
);

router.post(
    "/profile",
    requireAuth,
    requireProvider,
    validateBody(createProviderProfileSchema),
    providerController.createProfile
);

router.put(
    "/profile",
    requireAuth,
    requireProvider,
    validateBody(updateProviderProfileSchema),
    providerController.updateMyProfile
);

// ─────────────────────────────────────────────────────────────
// MEAL ROUTES (Provider's own meals)
// ─────────────────────────────────────────────────────────────

// Get provider's own meals
router.get(
    "/meals",
    requireAuth,
    requireProvider,
    mealController.getMyMeals
);

// Create a new meal
router.post(
    "/meals",
    requireAuth,
    requireProvider,
    validateBody(createMealSchema),
    mealController.createMeal
);

// Update a meal
router.put(
    "/meals/:id",
    requireAuth,
    requireProvider,
    validateParams(mealIdParamSchema),
    validateBody(updateMealSchema),
    mealController.updateMeal
);

// Delete a meal
router.delete(
    "/meals/:id",
    requireAuth,
    requireProvider,
    validateParams(mealIdParamSchema),
    mealController.deleteMeal
);

export default router;

