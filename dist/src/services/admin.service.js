import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/AppError";
// ═══════════════════════════════════════════════════════════
// ADMIN SERVICE
// Business logic for admin management operations
// ═══════════════════════════════════════════════════════════
/**
 * Get all users with filters and pagination
 */
export const getUsers = async (query) => {
    const { role, search, isBanned, page, limit } = query;
    const where = {};
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
export const getUserById = async (userId) => {
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
export const banUser = async (adminId, userId, data) => {
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
 * Get all orders for admin monitoring
 */
export const getAllOrders = async (query) => {
    const { status, providerId, customerId, page, limit } = query;
    const where = {};
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
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
    const [totalUsers, totalProviders, totalOrders, totalMeals, recentOrders, orderStats,] = await Promise.all([
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
    ]);
    const ordersByStatus = orderStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
    }, {});
    return {
        totalUsers,
        totalProviders,
        totalOrders,
        totalMeals,
        ordersByStatus,
        recentOrders,
    };
};
//# sourceMappingURL=admin.service.js.map