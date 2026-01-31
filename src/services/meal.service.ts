import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError } from "../utils/AppError";
import type { CreateMealInput, UpdateMealInput, MealQueryInput } from "../validations/meal.validation";

// ═══════════════════════════════════════════════════════════
// MEAL SERVICE
// Business logic for meal management
// ═══════════════════════════════════════════════════════════

/**
 * Create a new meal (Provider only)
 */
export const createMeal = async (providerId: string, data: CreateMealInput) => {
    // Verify category exists
    const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
    });

    if (!category) {
        throw new NotFoundError("Category not found");
    }

    const meal = await prisma.meal.create({
        data: {
            name: data.name,
            description: data.description ?? null,
            price: data.price,
            image: data.image ?? null,
            categoryId: data.categoryId,
            providerProfileId: providerId,
            isAvailable: data.isAvailable ?? true,
        },
        include: {
            category: true,
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });

    return meal;
};

/**
 * Get all meals with optional filters (Public)
 */
export const getMeals = async (query: MealQueryInput) => {
    const { categoryId, providerId, search, minPrice, maxPrice, isAvailable, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (categoryId) where["categoryId"] = categoryId;
    if (providerId) where["providerProfileId"] = providerId;
    if (isAvailable !== undefined) where["isAvailable"] = isAvailable;

    if (search) {
        where["OR"] = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where["price"] = {};
        if (minPrice !== undefined) (where["price"] as Record<string, number>)["gte"] = minPrice;
        if (maxPrice !== undefined) (where["price"] as Record<string, number>)["lte"] = maxPrice;
    }

    const skip = (page - 1) * limit;

    const [meals, total] = await Promise.all([
        prisma.meal.findMany({
            where,
            include: {
                category: true,
                providerProfile: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.meal.count({ where }),
    ]);

    return {
        meals,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get meal by ID (Public)
 */
export const getMealById = async (mealId: string) => {
    const meal = await prisma.meal.findUnique({
        where: { id: mealId },
        include: {
            category: true,
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
            reviews: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!meal) {
        throw new NotFoundError("Meal not found");
    }

    return meal;
};

/**
 * Update meal (Provider only - must own the meal)
 */
export const updateMeal = async (mealId: string, providerId: string, data: UpdateMealInput) => {
    // Check if meal exists and belongs to provider
    const existingMeal = await prisma.meal.findUnique({
        where: { id: mealId },
    });

    if (!existingMeal) {
        throw new NotFoundError("Meal not found");
    }

    if (existingMeal.providerProfileId !== providerId) {
        throw new ForbiddenError("You can only update your own meals");
    }

    // If categoryId is being updated, verify it exists
    if (data.categoryId) {
        const category = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });
        if (!category) {
            throw new NotFoundError("Category not found");
        }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.description !== undefined) updateData["description"] = data.description;
    if (data.price !== undefined) updateData["price"] = data.price;
    if (data.image !== undefined) updateData["image"] = data.image;
    if (data.categoryId !== undefined) updateData["categoryId"] = data.categoryId;
    if (data.isAvailable !== undefined) updateData["isAvailable"] = data.isAvailable;

    const meal = await prisma.meal.update({
        where: { id: mealId },
        data: updateData,
        include: {
            category: true,
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });

    return meal;
};

/**
 * Delete meal (Provider only - must own the meal)
 */
export const deleteMeal = async (mealId: string, providerId: string) => {
    // Check if meal exists and belongs to provider
    const existingMeal = await prisma.meal.findUnique({
        where: { id: mealId },
    });

    if (!existingMeal) {
        throw new NotFoundError("Meal not found");
    }

    if (existingMeal.providerProfileId !== providerId) {
        throw new ForbiddenError("You can only delete your own meals");
    }

    await prisma.meal.delete({
        where: { id: mealId },
    });

    return { message: "Meal deleted successfully" };
};

/**
 * Get provider's own meals
 */
export const getProviderMeals = async (providerId: string) => {
    const meals = await prisma.meal.findMany({
        where: { providerProfileId: providerId },
        include: {
            category: true,
            _count: {
                select: { reviews: true, orderItems: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return meals;
};
