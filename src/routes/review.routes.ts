import { Router, IRouter } from "express";
import * as reviewController from "../controllers/review.controller";
import { requireAuth, requireCustomer, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    createReviewSchema,
    updateReviewSchema,
    reviewQuerySchema,
    reviewIdParamSchema,
    mealIdParamSchema,
} from "../validations/review.validation";

const router: IRouter = Router();

// REVIEW ROUTES
// /api/reviews/*

// Create a new review
router.post(
    "/",
    requireAuth,
    requireCustomer,
    validateBody(createReviewSchema),
    reviewController.createReview
);

// Get current user's reviews
router.get(
    "/me",
    requireAuth,
    requireCustomer,
    validateQuery(reviewQuerySchema),
    reviewController.getMyReviews
);

// Update a review
router.put(
    "/:id",
    requireAuth,
    requireCustomer,
    validateParams(reviewIdParamSchema),
    validateBody(updateReviewSchema),
    reviewController.updateReview
);

// Delete a review
router.delete(
    "/:id",
    requireAuth,
    requireCustomer,
    validateParams(reviewIdParamSchema),
    reviewController.deleteReview
);

export default router;
