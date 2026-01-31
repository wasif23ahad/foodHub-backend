import { Router, IRouter } from "express";
import providerRoutes from "./provider.routes";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// API ROUTES
// All routes are prefixed with /api
// ═══════════════════════════════════════════════════════════

// Provider routes - /api/provider/*
router.use("/provider", providerRoutes);

// Future routes will be added here:
// router.use("/meals", mealRoutes);
// router.use("/orders", orderRoutes);
// router.use("/reviews", reviewRoutes);
// router.use("/admin", adminRoutes);
// router.use("/categories", categoryRoutes);
// router.use("/providers", publicProviderRoutes);

export default router;
