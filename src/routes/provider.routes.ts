import { Router, IRouter } from "express";
import * as providerController from "../controllers/provider.controller";
import { requireAuth, requireProvider, validateBody } from "../middlewares";
import {
    createProviderProfileSchema,
    updateProviderProfileSchema,
} from "../validations/provider.validation";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// PROVIDER ROUTES
// /api/provider/*
// ═══════════════════════════════════════════════════════════

// Protected routes - require authentication and provider role
router.get(
    "/profile",
    requireAuth,
    requireProvider,
    providerController.getMyProfile
);

router.post(
    "/profile",
    requireAuth,
    requireProvider,
    validateBody(createProviderProfileSchema),
    providerController.createProfile
);

router.put(
    "/profile",
    requireAuth,
    requireProvider,
    validateBody(updateProviderProfileSchema),
    providerController.updateMyProfile
);

export default router;
