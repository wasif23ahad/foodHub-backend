import { Router, IRouter } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth, requireRole } from "../middlewares";

const router: IRouter = Router();

// Admin Global Analytics
router.get("/admin", requireAuth, requireRole("ADMIN"), analyticsController.getAdminAnalytics);

// Provider Specific Analytics
router.get("/provider", requireAuth, requireRole("PROVIDER"), analyticsController.getProviderAnalytics);

export default router;
