import { Request, Response, NextFunction } from "express";
import * as analyticsService from "../services/analytics.service";
import { sendSuccess } from "../utils/response.util";
import { ForbiddenError } from "../utils/AppError";
import prisma from "../lib/prisma";

/**
 * GET /api/analytics/admin
 * Admin Global Analytics
 */
export const getAdminAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const days = req.query["days"] ? parseInt(req.query["days"] as string) : 30;
        const stats = await analyticsService.getAdminAnalytics(days);
        sendSuccess(res, stats, "Admin analytics fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/analytics/provider
 * Provider Specific Analytics
 */
export const getProviderAnalytics = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const providerProfile = await prisma.providerProfile.findUnique({
            where: { userId }
        });

        if (!providerProfile) {
            throw new ForbiddenError("Provider profile not found");
        }

        const days = req.query["days"] ? parseInt(req.query["days"] as string) : 30;
        const stats = await analyticsService.getProviderAnalytics(providerProfile.id, days);
        sendSuccess(res, stats, "Provider analytics fetched successfully");
    } catch (error) {
        next(error);
    }
};
