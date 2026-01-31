import * as providerService from "../services/provider.service";
import { sendSuccess, sendCreated } from "../utils/response.util";
// Import types
import "../types";
// ═══════════════════════════════════════════════════════════
// PROVIDER CONTROLLER
// Handles HTTP requests for provider profile management
// ═══════════════════════════════════════════════════════════
/**
 * GET /api/provider/profile
 * Get current provider's profile
 */
export const getMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await providerService.getProfileByUserId(userId);
        sendSuccess(res, profile, "Profile fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * POST /api/provider/profile
 * Create provider profile
 */
export const createProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await providerService.createProfile(userId, req.body);
        sendCreated(res, profile, "Profile created successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * PUT /api/provider/profile
 * Update current provider's profile
 */
export const updateMyProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await providerService.updateProfile(userId, req.body);
        sendSuccess(res, profile, "Profile updated successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/providers/:id
 * Get provider by ID (public)
 */
export const getProviderById = async (req, res, next) => {
    try {
        const id = req.params["id"];
        const provider = await providerService.getProfileById(id);
        sendSuccess(res, provider, "Provider fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/providers
 * Get all providers (public)
 */
export const getAllProviders = async (req, res, next) => {
    try {
        const query = res.locals["validatedQuery"] || {
            page: 1,
            limit: 20,
        };
        const providers = await providerService.getAllProviders(query);
        sendSuccess(res, providers, "Providers fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=provider.controller.js.map