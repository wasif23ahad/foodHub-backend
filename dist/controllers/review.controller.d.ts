import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * POST /api/reviews
 * Create a new review
 */
export declare const createReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/meals/:mealId/reviews
 * Get reviews for a specific meal
 */
export declare const getMealReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/reviews/:id
 * Update a review
 */
export declare const updateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * DELETE /api/reviews/:id
 * Delete a review
 */
export declare const deleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/reviews/me
 * Get current user's reviews
 */
export declare const getMyReviews: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=review.controller.d.ts.map