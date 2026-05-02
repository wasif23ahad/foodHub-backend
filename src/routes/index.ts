import { Router, IRouter } from "express";
import providerRoutes from "./provider.routes";
import mealRoutes from "./meal.routes";
import orderRoutes from "./order.routes";
import categoryRoutes from "./category.routes";
import publicProviderRoutes from "./public-provider.routes";
import userRoutes from "./user.routes";
import uploadRoutes from "./upload.routes";
import adminRoutes from "./admin.routes";
import analyticsRoutes from "./analytics.routes";
import aiRoutes from "./ai.routes";

const router: IRouter = Router();

// Health check
router.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/user", userRoutes);
router.use("/provider", providerRoutes);
router.use("/meals", mealRoutes);
router.use("/orders", orderRoutes);
router.use("/categories", categoryRoutes);
router.use("/providers", publicProviderRoutes);
router.use("/upload", uploadRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/ai", aiRoutes);

export default router;
