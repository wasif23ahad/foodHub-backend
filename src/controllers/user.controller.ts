import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { sendSuccess } from "../utils/response.util";

// Import types
import "../types";

// ═══════════════════════════════════════════════════════════
// USER CONTROLLER
// Handles user profile management endpoints
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const profile = await userService.getProfile(userId);
        sendSuccess(res, profile, "Profile fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const profile = await userService.updateProfile(userId, req.body);
        sendSuccess(res, profile, "Profile updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/orders
 * Get current user's order history
 */
export const getOrderHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const result = await userService.getOrderHistory(userId);
        sendSuccess(res, result, "Order history fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/user/dashboard
 * Get current user's dashboard stats
 */
export const getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const stats = await userService.getDashboardStats(userId);
        sendSuccess(res, stats, "Dashboard stats fetched successfully");
    } catch (error) {
        next(error);
    }
};
