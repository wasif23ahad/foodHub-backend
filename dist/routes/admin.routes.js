import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as categoryController from "../controllers/category.controller";
import { requireAuth, requireAdmin, validateBody, validateQuery, validateParams } from "../middlewares";
import { userListQuerySchema, banUserSchema, userIdParamSchema, adminOrderQuerySchema, } from "../validations/admin.validation";
import { createCategorySchema, updateCategorySchema, categoryIdParamSchema, } from "../validations/category.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// ADMIN ROUTES
// /api/admin/*
// All routes require admin role
// ═══════════════════════════════════════════════════════════
// Apply auth + admin middleware to all routes
router.use(requireAuth, requireAdmin);
// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
// Get dashboard statistics
router.get("/dashboard", adminController.getDashboardStats);
// ─────────────────────────────────────────────────────────────
// USER MANAGEMENT
// ─────────────────────────────────────────────────────────────
// Get all users with filters
router.get("/users", validateQuery(userListQuerySchema), adminController.getUsers);
// Get user by ID
router.get("/users/:id", validateParams(userIdParamSchema), adminController.getUserById);
// Ban or unban a user
router.patch("/users/:id/ban", validateParams(userIdParamSchema), validateBody(banUserSchema), adminController.banUser);
// ─────────────────────────────────────────────────────────────
// ORDER MONITORING
// ─────────────────────────────────────────────────────────────
// Get all orders
router.get("/orders", validateQuery(adminOrderQuerySchema), adminController.getAllOrders);
// ─────────────────────────────────────────────────────────────
// CATEGORY MANAGEMENT
// ─────────────────────────────────────────────────────────────
// Create a new category
router.post("/categories", validateBody(createCategorySchema), categoryController.createCategory);
// Update a category
router.put("/categories/:id", validateParams(categoryIdParamSchema), validateBody(updateCategorySchema), categoryController.updateCategory);
// Delete a category
router.delete("/categories/:id", validateParams(categoryIdParamSchema), categoryController.deleteCategory);
export default router;
//# sourceMappingURL=admin.routes.js.map