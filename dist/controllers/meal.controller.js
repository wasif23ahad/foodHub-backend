import * as mealService from "../services/meal.service";
import * as providerService from "../services/provider.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.util";
// Import types
import "../types";
// ═══════════════════════════════════════════════════════════
// MEAL CONTROLLER
// Handles HTTP requests for meal management
// ═══════════════════════════════════════════════════════════
/**
 * POST /api/provider/meals
 * Create a new meal (Provider only)
 */
export const createMeal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Get provider profile ID
        const profile = await providerService.getProfileByUserId(userId);
        const meal = await mealService.createMeal(profile.id, req.body);
        sendCreated(res, meal, "Meal created successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/meals
 * Get all meals with filters (Public)
 */
export const getMeals = async (req, res, next) => {
    try {
        // Use validated query from res.locals (set by validateQuery middleware)
        const query = res.locals["validatedQuery"] || req.query;
        const result = await mealService.getMeals(query);
        sendSuccess(res, result.meals, "Meals fetched successfully", 200, result.meta);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/meals/:id
 * Get meal by ID (Public)
 */
export const getMealById = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const meal = await mealService.getMealById(id);
        sendSuccess(res, meal, "Meal fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * PUT /api/provider/meals/:id
 * Update meal (Provider only)
 */
export const updateMeal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const mealId = req.params["id"];
        const profile = await providerService.getProfileByUserId(userId);
        const meal = await mealService.updateMeal(mealId, profile.id, req.body);
        sendSuccess(res, meal, "Meal updated successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * DELETE /api/provider/meals/:id
 * Delete meal (Provider only)
 */
export const deleteMeal = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const mealId = req.params["id"];
        const profile = await providerService.getProfileByUserId(userId);
        await mealService.deleteMeal(mealId, profile.id);
        sendNoContent(res);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/provider/meals
 * Get provider's own meals (Provider only)
 */
export const getMyMeals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await providerService.getProfileByUserId(userId);
        const meals = await mealService.getProviderMeals(profile.id);
        sendSuccess(res, meals, "Meals fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=meal.controller.js.map