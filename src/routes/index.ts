import { Router, IRouter } from "express";
import providerRoutes from "./provider.routes";
import mealRoutes from "./meal.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import adminRoutes from "./admin.routes";
import categoryRoutes from "./category.routes";
import publicProviderRoutes from "./public-provider.routes";
import userRoutes from "./user.routes";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// API ROUTES
// All routes are prefixed with /api
// ═══════════════════════════════════════════════════════════

// User routes - /api/user/* (Authenticated users)
router.use("/user", userRoutes);

// Provider routes - /api/provider/* (Authenticated providers)
router.use("/provider", providerRoutes);

// Meal routes - /api/meals/* (Public)
router.use("/meals", mealRoutes);

// Order routes - /api/orders/* (Customer)
router.use("/orders", orderRoutes);

// Review routes - /api/reviews/*
router.use("/reviews", reviewRoutes);

// Admin routes - /api/admin/* (Admin only)
router.use("/admin", adminRoutes);

// Category routes - /api/categories/* (Public)
router.use("/categories", categoryRoutes);

// Public provider routes - /api/providers/* (Public)
router.use("/providers", publicProviderRoutes);

export default router;

// Last updated: Commit 20 - Polish & Documentation

