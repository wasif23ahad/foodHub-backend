import { Router, IRouter } from "express";
import providerRoutes from "./provider.routes";
import mealRoutes from "./meal.routes";
import orderRoutes from "./order.routes";

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

// Future routes will be added here:
// router.use("/reviews", reviewRoutes);
// router.use("/admin", adminRoutes);
// router.use("/categories", categoryRoutes);
// router.use("/providers", publicProviderRoutes);

export default router;

