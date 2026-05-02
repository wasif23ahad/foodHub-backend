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

import uploadRoutes from "./upload.routes";
import analyticsRoutes from "./analytics.routes";

router.use("/user", userRoutes);
router.use("/provider", providerRoutes);
router.use("/meals", mealRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/providers", publicProviderRoutes);
router.use("/upload", uploadRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
