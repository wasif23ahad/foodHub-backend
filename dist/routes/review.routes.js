import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { requireAuth, validateBody, validateQuery, validateParams } from "../middlewares";
import { createReviewSchema, updateReviewSchema, reviewQuerySchema, reviewIdParamSchema, } from "../validations/review.validation";
const router = Router();
// ═══════════════════════════════════════════════════════════
// REVIEW ROUTES
// /api/reviews/*
// ═══════════════════════════════════════════════════════════
// Create a new review
router.post("/", requireAuth, validateBody(createReviewSchema), reviewController.createReview);
// Get current user's reviews
router.get("/me", requireAuth, validateQuery(reviewQuerySchema), reviewController.getMyReviews);
// Update a review
router.put("/:id", requireAuth, validateParams(reviewIdParamSchema), validateBody(updateReviewSchema), reviewController.updateReview);
// Delete a review
router.delete("/:id", requireAuth, validateParams(reviewIdParamSchema), reviewController.deleteReview);
export default router;
//# sourceMappingURL=review.routes.js.map