import { Router, IRouter } from "express";
import * as adminController from "../controllers/admin.controller";
import * as categoryController from "../controllers/category.controller";
import { requireAuth, requireAdmin, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    userListQuerySchema,
    banUserSchema,
    userIdParamSchema,
    providerIdParamSchema,
    adminOrderQuerySchema,
} from "../validations/admin.validation";
import {
    createCategorySchema,
    updateCategorySchema,
    categoryIdParamSchema,
} from "../validations/category.validation";
import { mealQuerySchema, mealIdParamSchema } from "../validations/meal.validation";

const router: IRouter = Router();

router.use(requireAuth, requireAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// Users
router.get("/users", validateQuery(userListQuerySchema), adminController.getUsers);
router.get("/users/:id", validateParams(userIdParamSchema), adminController.getUserById);
router.patch("/users/:id/ban", validateParams(userIdParamSchema), validateBody(banUserSchema), adminController.banUser);
router.delete("/users/:id", validateParams(userIdParamSchema), adminController.deleteUser);

// Providers
router.delete("/providers/:id", validateParams(providerIdParamSchema), adminController.deleteProvider);

// Meals
router.get("/meals", validateQuery(mealQuerySchema), adminController.getAllMeals);
router.delete("/meals/:id", validateParams(mealIdParamSchema), adminController.deleteMeal);

// Orders
router.get("/orders", validateQuery(adminOrderQuerySchema), adminController.getAllOrders);

// Categories
router.post("/categories", validateBody(createCategorySchema), categoryController.createCategory);
router.put("/categories/:id", validateParams(categoryIdParamSchema), validateBody(updateCategorySchema), categoryController.updateCategory);
router.delete("/categories/:id", validateParams(categoryIdParamSchema), categoryController.deleteCategory);

export default router;
