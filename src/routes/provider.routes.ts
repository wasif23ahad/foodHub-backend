import { Router, IRouter } from "express";
import * as providerController from "../controllers/provider.controller";
import * as mealController from "../controllers/meal.controller";
import * as orderController from "../controllers/order.controller";
import { requireAuth, requireProvider, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    createProviderProfileSchema,
    updateProviderProfileSchema,
} from "../validations/provider.validation";
import { createMealSchema, updateMealSchema, mealIdParamSchema } from "../validations/meal.validation";
import { orderQuerySchema, orderIdParamSchema, updateOrderStatusSchema } from "../validations/order.validation";

const router: IRouter = Router();

// Profile
router.get("/profile", requireAuth, requireProvider, providerController.getMyProfile);
router.post("/profile", requireAuth, requireProvider, validateBody(createProviderProfileSchema), providerController.createProfile);
router.put("/profile", requireAuth, requireProvider, validateBody(updateProviderProfileSchema), providerController.updateMyProfile);

// Meals
router.get("/meals", requireAuth, requireProvider, mealController.getMyMeals);
router.post("/meals", requireAuth, requireProvider, validateBody(createMealSchema), mealController.createMeal);
router.put("/meals/:id", requireAuth, requireProvider, validateParams(mealIdParamSchema), validateBody(updateMealSchema), mealController.updateMeal);
router.delete("/meals/:id", requireAuth, requireProvider, validateParams(mealIdParamSchema), mealController.deleteMeal);

// Orders
router.get("/orders", requireAuth, requireProvider, validateQuery(orderQuerySchema), orderController.getProviderOrders);
router.get("/orders/:id", requireAuth, requireProvider, validateParams(orderIdParamSchema), orderController.getProviderOrderById);
router.patch("/orders/:id/status", requireAuth, requireProvider, validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;
