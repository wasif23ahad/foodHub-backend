import { Router } from "express";
import * as providerController from "../controllers/provider.controller";
import * as mealController from "../controllers/meal.controller";
import * as orderController from "../controllers/order.controller";
import { requireAuth, requireProvider, validateBody, validateQuery, validateParams } from "../middlewares";
import { createProviderProfileSchema, updateProviderProfileSchema, } from "../validations/provider.validation";
import { createMealSchema, updateMealSchema, mealIdParamSchema } from "../validations/meal.validation";
import { orderQuerySchema, orderIdParamSchema, updateOrderStatusSchema } from "../validations/order.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// PROVIDER ROUTES
// /api/provider/*
// ═══════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────────────────────
router.get("/profile", requireAuth, requireProvider, providerController.getMyProfile);
router.post("/profile", requireAuth, requireProvider, validateBody(createProviderProfileSchema), providerController.createProfile);
router.put("/profile", requireAuth, requireProvider, validateBody(updateProviderProfileSchema), providerController.updateMyProfile);
// ─────────────────────────────────────────────────────────────
// MEAL ROUTES (Provider's own meals)
// ─────────────────────────────────────────────────────────────
// Get provider's own meals
router.get("/meals", requireAuth, requireProvider, mealController.getMyMeals);
// Create a new meal
router.post("/meals", requireAuth, requireProvider, validateBody(createMealSchema), mealController.createMeal);
// Update a meal
router.put("/meals/:id", requireAuth, requireProvider, validateParams(mealIdParamSchema), validateBody(updateMealSchema), mealController.updateMeal);
// Delete a meal
router.delete("/meals/:id", requireAuth, requireProvider, validateParams(mealIdParamSchema), mealController.deleteMeal);
// ─────────────────────────────────────────────────────────────
// ORDER ROUTES (Provider's received orders)
// ─────────────────────────────────────────────────────────────
// Get provider's orders
router.get("/orders", requireAuth, requireProvider, validateQuery(orderQuerySchema), orderController.getProviderOrders);
// Get specific order details
router.get("/orders/:id", requireAuth, requireProvider, validateParams(orderIdParamSchema), orderController.getProviderOrderById);
// Update order status
router.patch("/orders/:id/status", requireAuth, requireProvider, validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);
export default router;
//# sourceMappingURL=provider.routes.js.map