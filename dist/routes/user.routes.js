import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth, validateBody } from "../middlewares";
import { updateProfileSchema } from "../validations/user.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// USER ROUTES
// /api/user/*
// All routes require authentication
// ═══════════════════════════════════════════════════════════
// Apply auth middleware to all routes
router.use(requireAuth);
// ─────────────────────────────────────────────────────────────
// PROFILE MANAGEMENT
// ─────────────────────────────────────────────────────────────
// Get current user's profile
router.get("/profile", userController.getProfile);
// Update current user's profile
router.patch("/profile", validateBody(updateProfileSchema), userController.updateProfile);
// ─────────────────────────────────────────────────────────────
// USER DASHBOARD
// ─────────────────────────────────────────────────────────────
// Get user dashboard stats
router.get("/dashboard", userController.getDashboard);
// Get user's order history
router.get("/orders", userController.getOrderHistory);
export default router;
//# sourceMappingURL=user.routes.js.map