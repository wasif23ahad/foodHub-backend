import { Request, Response, NextFunction } from "express";
import * as providerService from "../services/provider.service";
import { sendSuccess } from "../utils/response.util";

// ═══════════════════════════════════════════════════════════
// PUBLIC PROVIDER CONTROLLER
// Handles public provider browsing endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/providers
 * Get all active providers with filters (Public)
 */
export const getProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = res.locals["validatedQuery"] || req.query;
        const result = await providerService.getAllProviders(query);
        sendSuccess(res, result.providers, "Providers fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/providers/:id
 * Get provider details with meals (Public)
 */
export const getProviderById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const providerId = req.params["id"] as string;
        const provider = await providerService.getProfileById(providerId);
        sendSuccess(res, provider, "Provider fetched successfully");
    } catch (error) {
        next(error);
    }
};
