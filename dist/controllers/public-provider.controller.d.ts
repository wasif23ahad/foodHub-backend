import { Request, Response, NextFunction } from "express";
/**
 * GET /api/providers
 * Get all active providers with filters (Public)
 */
export declare const getProviders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/providers/:id
 * Get provider details with meals (Public)
 */
export declare const getProviderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=public-provider.controller.d.ts.map