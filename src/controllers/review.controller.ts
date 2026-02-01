import { Request, Response, NextFunction } from "express";
import * as reviewService from "../services/review.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.util";

// Import types
import "../types";

// ═══════════════════════════════════════════════════════════
// REVIEW CONTROLLER
// Handles HTTP requests for review management
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/orders/:id/reviews
 * Rate an entire order (creates reviews for all items)
 */
export const createOrderReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const orderId = req.params["id"] as string;
        const result = await reviewService.createOrderReview(userId, orderId, req.body);
        sendCreated(res, result, "Order rated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/reviews
 * Create a new review
 */
export const createReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const review = await reviewService.createReview(userId, req.body);
        sendCreated(res, review, "Review created successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/meals/:mealId/reviews
 * Get reviews for a specific meal
 */
export const getMealReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const mealId = req.params["mealId"] as string;
        const query = res.locals["validatedQuery"] || req.query;
        const result = await reviewService.getMealReviews(mealId, query);
        sendSuccess(res, result.reviews, "Reviews fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/reviews/:id
 * Update a review
 */
export const updateReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const reviewId = req.params["id"] as string;
        const review = await reviewService.updateReview(reviewId, userId, req.body);
        sendSuccess(res, review, "Review updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
export const deleteReview = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const reviewId = req.params["id"] as string;
        await reviewService.deleteReview(reviewId, userId);
        sendNoContent(res);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/reviews/me
 * Get current user's reviews
 */
export const getMyReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = req.user!.id;
        const query = res.locals["validatedQuery"] || req.query;
        const result = await reviewService.getMyReviews(userId, query);
        sendSuccess(res, result.reviews, "Reviews fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};
