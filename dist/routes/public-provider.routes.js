import { Router } from "express";
import * as publicProviderController from "../controllers/public-provider.controller";
import { validateQuery, validateParams } from "../middlewares";
import { providerQuerySchema, providerIdParamSchema } from "../validations/public-provider.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// PUBLIC PROVIDER ROUTES
// /api/providers/*
// ═══════════════════════════════════════════════════════════
// Get all active providers (Public)
router.get("/", validateQuery(providerQuerySchema), publicProviderController.getProviders);
// Get provider by ID with meals (Public)
router.get("/:id", validateParams(providerIdParamSchema), publicProviderController.getProviderById);
export default router;
//# sourceMappingURL=public-provider.routes.js.map