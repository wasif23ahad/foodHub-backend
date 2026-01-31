import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * GET /api/provider/profile
 * Get current provider's profile
 */
export declare const getMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * POST /api/provider/profile
 * Create provider profile
 */
export declare const createProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/provider/profile
 * Update current provider's profile
 */
export declare const updateMyProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/providers/:id
 * Get provider by ID (public)
 */
export declare const getProviderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/providers
 * Get all providers (public)
 */
export declare const getAllProviders: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=provider.controller.d.ts.map