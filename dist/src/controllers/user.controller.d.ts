import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * GET /api/user/profile
 * Get current user's profile
 */
export declare const getProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export declare const updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/user/orders
 * Get current user's order history
 */
export declare const getOrderHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/user/dashboard
 * Get current user's dashboard stats
 */
export declare const getDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map