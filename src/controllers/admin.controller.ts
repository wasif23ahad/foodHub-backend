import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import { sendSuccess } from "../utils/response.util";

import "../types";

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
 * GET /api/admin/orders/:id
 * Get an order for admin monitoring
 */
export const getOrderById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const orderId = req.params["id"] as string;
        const order = await adminService.getOrderById(orderId);
        sendSuccess(res, order, "Order fetched successfully");
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

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const adminId = req.user!.id;
        const userId = req.params["id"] as string;
        const result = await adminService.deleteUser(adminId, userId);
        sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/providers/:id
 * Delete a provider profile
 */
export const deleteProvider = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const providerId = req.params["id"] as string;
        const result = await adminService.deleteProvider(providerId);
        sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/providers
 * Get all providers, including inactive
 */
export const getProviders = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await adminService.getProviders(req.query);
        sendSuccess(res, result.providers, "Providers fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/admin/providers/:id/status
 * Suspend or activate a provider profile
 */
export const updateProviderStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const providerId = req.params["id"] as string;
        const provider = await adminService.updateProviderStatus(providerId, Boolean(req.body.isActive));
        sendSuccess(res, provider, provider.isActive ? "Provider activated successfully" : "Provider suspended successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/meals
 * Get all meals for admin
 */
export const getAllMeals = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = res.locals["validatedQuery"] || req.query;
        const result = await adminService.getAllMeals(query);
        sendSuccess(res, result.meals, "Meals fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/meals/:id
 * Delete a meal
 */
export const deleteMeal = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const mealId = req.params["id"] as string;
        const result = await adminService.deleteMeal(mealId);
        sendSuccess(res, result, result.message);
    } catch (error) {
        next(error);
    }
};
