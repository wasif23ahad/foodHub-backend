import type { CreateReviewInput, UpdateReviewInput, ReviewQueryInput } from "../validations/review.validation";
/**
 * Create a review for a meal
 */
export declare const createReview: (userId: string, data: CreateReviewInput) => Promise<{
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    meal: {
        id: string;
        name: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    rating: number;
    mealId: string;
    comment: string | null;
}>;
/**
 * Get reviews for a specific meal
 */
export declare const getMealReviews: (mealId: string, query: ReviewQueryInput) => Promise<{
    reviews: ({
        user: {
            id: string;
            name: string;
            image: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        mealId: string;
        comment: string | null;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        averageRating: number;
    };
}>;
/**
 * Update a review (user can only update their own)
 */
export declare const updateReview: (reviewId: string, userId: string, data: UpdateReviewInput) => Promise<{
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    meal: {
        id: string;
        name: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    rating: number;
    mealId: string;
    comment: string | null;
}>;
/**
 * Delete a review (user can only delete their own)
 */
export declare const deleteReview: (reviewId: string, userId: string) => Promise<{
    message: string;
}>;
/**
 * Get user's own reviews
 */
export declare const getMyReviews: (userId: string, query: ReviewQueryInput) => Promise<{
    reviews: ({
        meal: {
            id: string;
            name: string;
            image: string | null;
            price: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        rating: number;
        mealId: string;
        comment: string | null;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=review.service.d.ts.map