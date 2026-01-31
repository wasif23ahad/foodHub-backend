import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * GET /api/admin/users
 * Get all users with filters
 */
export declare const getUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/admin/users/:id
 * Get user details
 */
export declare const getUserById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PATCH /api/admin/users/:id/ban
 * Ban or unban a user
 */
export declare const banUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/admin/orders
 * Get all orders for monitoring
 */
export declare const getAllOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/admin/dashboard
 * Get dashboard statistics
 */
export declare const getDashboardStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map