import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from "../utils/AppError";
import type { CreateReviewInput, UpdateReviewInput, ReviewQueryInput } from "../validations/review.validation";

// ═══════════════════════════════════════════════════════════
// REVIEW SERVICE
// Business logic for review management
// ═══════════════════════════════════════════════════════════

/**
 * Create batch reviews for an order
 * Creates a review for each meal in the order
 */
export const createOrderReview = async (
    userId: string,
    orderId: string,
    data: { rating: number; comment?: string }
) => {
    // 1. Get the order
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: true,
        },
    });

    if (!order) {
        throw new NotFoundError("Order not found");
    }

    // 2. Verify ownership
    if (order.customerId !== userId) {
        throw new ForbiddenError("You can only rate your own orders");
    }

    // 3. Create reviews for each meal
    const reviews = await Promise.all(
        order.orderItems.map(async (item) => {
            // Upsert: Create if new, update if exists (in case they rate again)
            return prisma.review.upsert({
                where: {
                    userId_mealId: {
                        userId,
                        mealId: item.mealId,
                    },
                },
                update: {
                    rating: data.rating,
                    comment: data.comment ?? null,
                },
                create: {
                    userId,
                    mealId: item.mealId,
                    rating: data.rating,
                    comment: data.comment ?? null,
                },
            });
        })
    );

    return { message: "Reviews submitted successfully", count: reviews.length };
};

/**
 * Create a review for a meal
 */
export const createReview = async (userId: string, data: CreateReviewInput) => {
    // Check if meal exists
    const meal = await prisma.meal.findUnique({
        where: { id: data.mealId },
    });

    if (!meal) {
        throw new NotFoundError("Meal not found");
    }

    // Check if user has already reviewed this meal
    const existingReview = await prisma.review.findUnique({
        where: {
            userId_mealId: {
                userId,
                mealId: data.mealId,
            },
        },
    });

    if (existingReview) {
        throw new ConflictError("You have already reviewed this meal");
    }

    // Create the review
    const review = await prisma.review.create({
        data: {
            userId,
            mealId: data.mealId,
            rating: data.rating,
            comment: data.comment ?? null,
        },
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
            meal: {
                select: { id: true, name: true },
            },
        },
    });

    return review;
};

/**
 * Get reviews for a specific meal
 */
export const getMealReviews = async (mealId: string, query: ReviewQueryInput) => {
    const { page, limit } = query;

    // Check if meal exists
    const meal = await prisma.meal.findUnique({
        where: { id: mealId },
    });

    if (!meal) {
        throw new NotFoundError("Meal not found");
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { mealId },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({ where: { mealId } }),
    ]);

    // Calculate average rating
    const avgResult = await prisma.review.aggregate({
        where: { mealId },
        _avg: { rating: true },
    });

    return {
        reviews,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            averageRating: avgResult._avg.rating ?? 0,
        },
    };
};

/**
 * Update a review (user can only update their own)
 */
export const updateReview = async (reviewId: string, userId: string, data: UpdateReviewInput) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new NotFoundError("Review not found");
    }

    if (review.userId !== userId) {
        throw new ForbiddenError("You can only update your own reviews");
    }

    const updateData: Record<string, unknown> = {};
    if (data.rating !== undefined) updateData["rating"] = data.rating;
    if (data.comment !== undefined) updateData["comment"] = data.comment;

    const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: updateData,
        include: {
            user: {
                select: { id: true, name: true, image: true },
            },
            meal: {
                select: { id: true, name: true },
            },
        },
    });

    return updatedReview;
};

/**
 * Delete a review (user can only delete their own)
 */
export const deleteReview = async (reviewId: string, userId: string) => {
    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new NotFoundError("Review not found");
    }

    if (review.userId !== userId) {
        throw new ForbiddenError("You can only delete your own reviews");
    }

    await prisma.review.delete({
        where: { id: reviewId },
    });

    return { message: "Review deleted successfully" };
};

/**
 * Get user's own reviews
 */
export const getMyReviews = async (userId: string, query: ReviewQueryInput) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { userId },
            include: {
                meal: {
                    select: { id: true, name: true, image: true, price: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.review.count({ where: { userId } }),
    ]);

    return {
        reviews,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
