import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/AppError";
import type { UserListQueryInput, BanUserInput, AdminOrderQueryInput } from "../validations/admin.validation";
import type { MealQueryInput } from "../validations/meal.validation";

// ADMIN SERVICE
// Business logic for admin management operations

/**
 * Get all users with filters and pagination
 */
export const getUsers = async (query: UserListQueryInput) => {
    const { role, search, isBanned, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (role) {
        where["role"] = role;
    }

    if (isBanned !== undefined) {
        where["banned"] = isBanned;
    }

    if (search) {
        where["OR"] = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                banned: true,
                banReason: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get user by ID with detailed info
 */
export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            banned: true,
            banReason: true,
            createdAt: true,
            updatedAt: true,
            providerProfile: {
                select: {
                    id: true,
                    businessName: true,
                    createdAt: true,
                },
            },
            _count: {
                select: {
                    orders: true,
                    reviews: true,
                },
            },
        },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

/**
 * Ban a user
 */
export const banUser = async (adminId: string, userId: string, data: BanUserInput) => {
    // Prevent self-ban
    if (adminId === userId) {
        throw new BadRequestError("You cannot ban yourself");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    // Prevent banning other admins
    if (user.role === "ADMIN") {
        throw new ForbiddenError("Cannot ban other administrators");
    }

    if (data.banned && user.banned) {
        throw new BadRequestError("User is already banned");
    }

    if (!data.banned && !user.banned) {
        throw new BadRequestError("User is not banned");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            banned: data.banned,
            banReason: data.banned ? (data.banReason ?? null) : null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            banned: true,
            banReason: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

/**
 * Delete a user (admin cannot delete themselves or other admins)
 */
export const deleteUser = async (adminId: string, userId: string) => {
    if (adminId === userId) {
        throw new BadRequestError("You cannot delete yourself");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    if (user.role === "ADMIN") {
        throw new ForbiddenError("Cannot delete other administrators");
    }

    await prisma.user.delete({
        where: { id: userId },
    });

    return { message: "User deleted successfully" };
};

/**
 * Delete a provider profile
 */
export const deleteProvider = async (providerId: string) => {
    const provider = await prisma.providerProfile.findUnique({
        where: { id: providerId },
    });

    if (!provider) {
        throw new NotFoundError("Provider not found");
    }

    await prisma.providerProfile.delete({
        where: { id: providerId },
    });

    return { message: "Provider deleted successfully" };
};

/**
 * Get all providers for admin, including inactive providers.
 */
export const getProviders = async (query: { search?: string; cuisineType?: string; page?: number; limit?: number }) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where: Record<string, unknown> = {};

    if (query.cuisineType) {
        where["cuisineType"] = { contains: query.cuisineType, mode: "insensitive" };
    }

    if (query.search) {
        where["OR"] = [
            { businessName: { contains: query.search, mode: "insensitive" } },
            { contactEmail: { contains: query.search, mode: "insensitive" } },
            { cuisineType: { contains: query.search, mode: "insensitive" } },
        ];
    }

    const skip = (page - 1) * limit;
    const [providers, total] = await Promise.all([
        prisma.providerProfile.findMany({
            where,
            include: {
                user: {
                    select: { id: true, name: true, email: true, banned: true },
                },
                _count: {
                    select: { meals: true, orders: true },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.providerProfile.count({ where }),
    ]);

    return {
        providers,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Suspend or activate a provider profile.
 */
export const updateProviderStatus = async (providerId: string, isActive: boolean) => {
    const provider = await prisma.providerProfile.findUnique({
        where: { id: providerId },
    });

    if (!provider) {
        throw new NotFoundError("Provider not found");
    }

    return prisma.providerProfile.update({
        where: { id: providerId },
        data: { isActive },
        include: {
            user: {
                select: { id: true, name: true, email: true, banned: true },
            },
        },
    });
};

/**
 * Get all meals for admin
 */
export const getAllMeals = async (query: MealQueryInput) => {
    const { search, categoryId, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (search) {
        where["OR"] = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }

    if (categoryId) {
        where["categoryId"] = categoryId;
    }

    const skip = (page - 1) * limit;

    const [meals, total] = await Promise.all([
        prisma.meal.findMany({
            where,
            include: {
                providerProfile: {
                    select: { id: true, businessName: true },
                },
                category: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { reviews: true, orderItems: true },
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
 * Delete a meal (admin)
 */
export const deleteMeal = async (mealId: string) => {
    const meal = await prisma.meal.findUnique({
        where: { id: mealId },
    });

    if (!meal) {
        throw new NotFoundError("Meal not found");
    }

    await prisma.meal.delete({
        where: { id: mealId },
    });

    return { message: "Meal deleted successfully" };
};

/**
 * Get all orders for admin monitoring
 */
export const getAllOrders = async (query: AdminOrderQueryInput) => {
    const { status, providerId, customerId, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (status) {
        where["status"] = status;
    }

    if (providerId) {
        where["providerProfileId"] = providerId;
    }

    if (customerId) {
        where["customerId"] = customerId;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                providerProfile: {
                    include: {
                        user: {
                            select: { id: true, name: true },
                        },
                    },
                },
                orderItems: {
                    include: {
                        meal: {
                            select: { id: true, name: true, price: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.order.count({ where }),
    ]);

    return {
        orders,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single order for admin monitoring.
 */
export const getOrderById = async (orderId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            customer: {
                select: { id: true, name: true, email: true, phone: true },
            },
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
            },
            orderItems: {
                include: {
                    meal: {
                        select: { id: true, name: true, price: true, image: true },
                    },
                },
            },
        },
    });

    if (!order) {
        throw new NotFoundError("Order not found");
    }

    return order;
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
    const [
        totalUsers,
        totalProviders,
        totalOrders,
        totalMeals,
        recentOrders,
        orderStats,
        revenueData,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.providerProfile.count(),
        prisma.order.count(),
        prisma.meal.count(),
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
                customer: {
                    select: { name: true },
                },
            },
        }),
        prisma.order.groupBy({
            by: ["status"],
            _count: true,
        }),
        prisma.order.aggregate({
            where: { status: "DELIVERED" },
            _sum: { totalAmount: true },
        }),
    ]);

    const totalRevenue = revenueData?._sum?.totalAmount || 0;

    const ordersByStatus = orderStats.reduce(
        (acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        },
        {} as Record<string, number>
    );

    return {
        totalUsers,
        totalProviders,
        totalOrders,
        totalMeals,
        totalRevenue,
        ordersByStatus,
        recentOrders,
    };
};
