import { Router, IRouter } from "express";
import * as adminController from "../controllers/admin.controller";
import { requireAuth, requireAdmin, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    userListQuerySchema,
    banUserSchema,
    userIdParamSchema,
    adminOrderQuerySchema,
} from "../validations/admin.validation";

const router: IRouter = Router();

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
router.get(
    "/users",
    validateQuery(userListQuerySchema),
    adminController.getUsers
);

// Get user by ID
router.get(
    "/users/:id",
    validateParams(userIdParamSchema),
    adminController.getUserById
);

// Ban or unban a user
router.patch(
    "/users/:id/ban",
    validateParams(userIdParamSchema),
    validateBody(banUserSchema),
    adminController.banUser
);

// ─────────────────────────────────────────────────────────────
// ORDER MONITORING
// ─────────────────────────────────────────────────────────────

// Get all orders
router.get(
    "/orders",
    validateQuery(adminOrderQuerySchema),
    adminController.getAllOrders
);

export default router;
