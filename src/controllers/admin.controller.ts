import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { sendSuccess } from "../utils/response.util";

// Import types
import "../types";

// ═══════════════════════════════════════════════════════════
// ADMIN CONTROLLER
// Handles HTTP requests for admin operations
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/admin/users
 * Get all users with filters
 */
export const getUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = res.locals["validatedQuery"] || req.query;
        const result = await adminService.getUsers(query);
        sendSuccess(res, result.users, "Users fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users/:id
 * Get user details
 */
export const getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.params["id"] as string;
        const user = await adminService.getUserById(userId);
        sendSuccess(res, user, "User fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban a user
 */
export const banUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const adminId = req.user!.id;
        const userId = req.params["id"] as string;
        const user = await adminService.banUser(adminId, userId, req.body);
        const message = req.body.banned ? "User banned successfully" : "User unbanned successfully";
        sendSuccess(res, user, message);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/orders
 * Get all orders for monitoring
 */
export const getAllOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = res.locals["validatedQuery"] || req.query;
        const result = await adminService.getAllOrders(query);
        sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
export const getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const stats = await adminService.getDashboardStats();
        sendSuccess(res, stats, "Dashboard stats fetched successfully");
    } catch (error) {
        next(error);
    }
};
