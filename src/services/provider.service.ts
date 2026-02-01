import prisma from "../lib/prisma";
import { NotFoundError, ConflictError } from "../utils/AppError";
import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "../validations/provider.validation";

// ═══════════════════════════════════════════════════════════
// PROVIDER SERVICE
// Business logic for provider profile management
// ═══════════════════════════════════════════════════════════

/**
 * Get provider profile by user ID
 */
export const getProfileByUserId = async (userId: string) => {
    const profile = await prisma.providerProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    if (!profile) {
        throw new NotFoundError("Provider profile not found");
    }

    return profile;
};

/**
 * Create provider profile
 */
export const createProfile = async (userId: string, data: CreateProviderProfileInput) => {
    // Check if profile already exists
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (existing) {
        throw new ConflictError("Provider profile already exists");
    }

    // Create the profile - explicitly build data to handle undefined vs null
    const profile = await prisma.providerProfile.create({
        data: {
            userId,
            businessName: data.businessName,
            description: data.description ?? null,
            logo: data.logo ?? null,
            address: data.address ?? null,
            phone: data.phone ?? null,
            cuisineType: data.cuisineType ?? null,
            contactEmail: data.contactEmail ?? null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    return profile;
};

/**
 * Update provider profile
 */
export const updateProfile = async (userId: string, data: UpdateProviderProfileInput) => {
    // Check if profile exists
    const existing = await prisma.providerProfile.findUnique({
        where: { userId },
    });

    if (!existing) {
        throw new NotFoundError("Provider profile not found");
    }

    // Update the profile - build update data with only defined values
    const updateData: Record<string, unknown> = {};
    if (data.businessName !== undefined) updateData["businessName"] = data.businessName;
    if (data.description !== undefined) updateData["description"] = data.description;
    if (data.logo !== undefined) updateData["logo"] = data.logo;
    if (data.address !== undefined) updateData["address"] = data.address;
    if (data.phone !== undefined) updateData["phone"] = data.phone;
    if (data.cuisineType !== undefined) updateData["cuisineType"] = data.cuisineType;
    if (data.contactEmail !== undefined) updateData["contactEmail"] = data.contactEmail;
    if (data.isActive !== undefined) updateData["isActive"] = data.isActive;

    const profile = await prisma.providerProfile.update({
        where: { userId },
        data: updateData,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    return profile;
};

/**
 * Get provider profile by ID with full details (public)
 */
export const getProfileById = async (profileId: string) => {
    const profile = await prisma.providerProfile.findFirst({
        where: { id: profileId, isActive: true },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            meals: {
                where: { isAvailable: true },
                include: {
                    category: true,
                    _count: {
                        select: { reviews: true, orderItems: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            },
            _count: {
                select: { meals: true, orders: true },
            },
        },
    });

    if (!profile) {
        throw new NotFoundError("Provider not found");
    }

    // Calculate average rating across all meals
    const mealIds = profile.meals.map((m) => m.id);
    const ratingStats = await prisma.review.aggregate({
        where: { mealId: { in: mealIds } },
        _avg: { rating: true },
        _count: true,
    });

    return {
        ...profile,
        meals: profile.meals.map((m) => ({
            ...m,
            providerProfile: {
                businessName: profile.businessName,
                id: profile.id,
                logo: profile.logo
            }
        })),
        avgRating: ratingStats._avg.rating ?? 0,
        totalReviews: ratingStats._count,
    };
};

// Provider query input type
type ProviderQueryInput = {
    search?: string;
    cuisineType?: string;
    page: number;
    limit: number;
};

/**
 * Get all active providers with filters (public)
 */
export const getAllProviders = async (query: ProviderQueryInput) => {
    const { search, cuisineType } = query;
    const pageNum = Number(query.page) || 1;
    const limitNum = Number(query.limit) || 10;

    const where: Record<string, unknown> = { isActive: true };

    if (cuisineType) {
        where["cuisineType"] = { contains: cuisineType, mode: "insensitive" };
    }

    if (search) {
        where["OR"] = [
            { businessName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { cuisineType: { contains: search, mode: "insensitive" } },
        ];
    }

    const skip = (pageNum - 1) * limitNum;

    const [providers, total] = await Promise.all([
        prisma.providerProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: { meals: true, orders: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limitNum,
        }),
        prisma.providerProfile.count({ where }),
    ]);

    // Calculate average ratings for each provider
    const providerIds = providers.map((p) => p.id);
    const mealsByProvider = await prisma.meal.findMany({
        where: { providerProfileId: { in: providerIds } },
        select: { id: true, providerProfileId: true },
    });

    const mealIdsByProvider: Record<string, string[]> = {};
    mealsByProvider.forEach((m) => {
        if (!mealIdsByProvider[m.providerProfileId]) {
            mealIdsByProvider[m.providerProfileId] = [];
        }
        mealIdsByProvider[m.providerProfileId]!.push(m.id);
    });

    const allMealIds = mealsByProvider.map((m) => m.id);
    const ratings = await prisma.review.groupBy({
        by: ["mealId"],
        where: { mealId: { in: allMealIds } },
        _avg: { rating: true },
        _count: { _all: true },
    });

    // Map ratings to providers
    const mealToRating: Record<string, { avg: number; count: number }> = {};
    ratings.forEach((r) => {
        mealToRating[r.mealId] = { avg: r._avg.rating ?? 0, count: r._count._all };
    });

    const enhancedProviders = providers.map((provider) => {
        const providerMealIds = mealIdsByProvider[provider.id] || [];
        let totalRating = 0;
        let totalReviews = 0;

        providerMealIds.forEach((mealId) => {
            const rating = mealToRating[mealId];
            if (rating) {
                totalRating += rating.avg * rating.count;
                totalReviews += rating.count;
            }
        });

        const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

        return {
            ...provider,
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews,
        };
    });

    return {
        providers: enhancedProviders,
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
        },
    };
};

