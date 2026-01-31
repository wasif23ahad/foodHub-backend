import { Router, IRouter } from "express";
import providerRoutes from "./provider.routes";
import mealRoutes from "./meal.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import adminRoutes from "./admin.routes";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// API ROUTES
// All routes are prefixed with /api
// ═══════════════════════════════════════════════════════════

// Provider routes - /api/provider/*
router.use("/provider", providerRoutes);

// Meal routes - /api/meals/* (Public)
router.use("/meals", mealRoutes);

// Order routes - /api/orders/* (Customer)
router.use("/orders", orderRoutes);

// Review routes - /api/reviews/*
router.use("/reviews", reviewRoutes);

// Admin routes - /api/admin/* (Admin only)
router.use("/admin", adminRoutes);

// Future routes will be added here:
// router.use("/categories", categoryRoutes);
// router.use("/providers", publicProviderRoutes);

export default router;

// Last updated: Commit 15 - Admin User Management

