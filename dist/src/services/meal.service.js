import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError } from "../utils/AppError";
// ═══════════════════════════════════════════════════════════
// MEAL SERVICE
// Business logic for meal management
// ═══════════════════════════════════════════════════════════
/**
 * Create a new meal (Provider only)
 */
export const createMeal = async (providerId, data) => {
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
export const getMeals = async (query) => {
    const { categoryId, providerId, search, minPrice, maxPrice, isAvailable, sort, page, limit } = query;
    const where = {};
    if (categoryId)
        where["categoryId"] = categoryId;
    if (providerId)
        where["providerProfileId"] = providerId;
    if (isAvailable !== undefined)
        where["isAvailable"] = isAvailable;
    if (search) {
        where["OR"] = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        where["price"] = {};
        if (minPrice !== undefined)
            where["price"]["gte"] = minPrice;
        if (maxPrice !== undefined)
            where["price"]["lte"] = maxPrice;
    }
    // Determine sort order
    let orderBy = { createdAt: "desc" };
    switch (sort) {
        case "price_asc":
            orderBy = { price: "asc" };
            break;
        case "price_desc":
            orderBy = { price: "desc" };
            break;
        case "oldest":
            orderBy = { createdAt: "asc" };
            break;
        case "newest":
        default:
            orderBy = { createdAt: "desc" };
            break;
        // rating and popular will be handled separately after fetching
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
                _count: {
                    select: { reviews: true, orderItems: true },
                },
            },
            orderBy,
            skip,
            take: limit,
        }),
        prisma.meal.count({ where }),
    ]);
    // Calculate average rating for each meal
    const mealIds = meals.map((m) => m.id);
    const ratings = await prisma.review.groupBy({
        by: ["mealId"],
        where: { mealId: { in: mealIds } },
        _avg: { rating: true },
        _count: true,
    });
    const ratingMap = ratings.reduce((acc, r) => {
        acc[r.mealId] = { avgRating: r._avg.rating ?? 0, reviewCount: r._count };
        return acc;
    }, {});
    // Enhance meals with rating info
    const enhancedMeals = meals.map((meal) => ({
        ...meal,
        avgRating: ratingMap[meal.id]?.avgRating ?? 0,
        reviewCount: ratingMap[meal.id]?.reviewCount ?? 0,
    }));
    // Sort by rating or popularity if needed
    let sortedMeals = enhancedMeals;
    if (sort === "rating") {
        sortedMeals = enhancedMeals.sort((a, b) => b.avgRating - a.avgRating);
    }
    else if (sort === "popular") {
        sortedMeals = enhancedMeals.sort((a, b) => b._count.orderItems - a._count.orderItems);
    }
    return {
        meals: sortedMeals,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};
/**
 * Get meal by ID with full details (Public)
 */
export const getMealById = async (mealId) => {
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
            _count: {
                select: { reviews: true, orderItems: true },
            },
        },
    });
    if (!meal) {
        throw new NotFoundError("Meal not found");
    }
    // Calculate average rating
    const ratingStats = await prisma.review.aggregate({
        where: { mealId },
        _avg: { rating: true },
        _count: true,
    });
    return {
        ...meal,
        avgRating: ratingStats._avg.rating ?? 0,
        totalReviews: ratingStats._count,
        totalOrders: meal._count.orderItems,
    };
};
/**
 * Update meal (Provider only - must own the meal)
 */
export const updateMeal = async (mealId, providerId, data) => {
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
    const updateData = {};
    if (data.name !== undefined)
        updateData["name"] = data.name;
    if (data.description !== undefined)
        updateData["description"] = data.description;
    if (data.price !== undefined)
        updateData["price"] = data.price;
    if (data.image !== undefined)
        updateData["image"] = data.image;
    if (data.categoryId !== undefined)
        updateData["categoryId"] = data.categoryId;
    if (data.isAvailable !== undefined)
        updateData["isAvailable"] = data.isAvailable;
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
export const deleteMeal = async (mealId, providerId) => {
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
export const getProviderMeals = async (providerId) => {
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
//# sourceMappingURL=meal.service.js.map