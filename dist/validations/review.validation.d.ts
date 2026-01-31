import { z } from "zod";
export declare const createReviewSchema: z.ZodObject<{
    mealId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const mealIdParamSchema: z.ZodObject<{
    mealId: z.ZodString;
}, z.core.$strip>;
export declare const reviewIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const reviewQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQueryInput = z.infer<typeof reviewQuerySchema>;
//# sourceMappingURL=review.validation.d.ts.map