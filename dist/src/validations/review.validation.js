import { z } from "zod";
// ═══════════════════════════════════════════════════════════
// REVIEW VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════
// Create review schema
export const createReviewSchema = z.object({
    mealId: z.string().cuid("Invalid meal ID"),
    rating: z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    comment: z.string().max(1000, "Comment is too long").optional(),
});
// Update review schema
export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5")
        .optional(),
    comment: z.string().max(1000, "Comment is too long").optional(),
});
// Meal ID param schema for getting reviews
export const mealIdParamSchema = z.object({
    mealId: z.string().cuid("Invalid meal ID"),
});
// Review ID param schema
export const reviewIdParamSchema = z.object({
    id: z.string().cuid("Invalid review ID"),
});
// Query schema for pagination
export const reviewQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
});
//# sourceMappingURL=review.validation.js.map