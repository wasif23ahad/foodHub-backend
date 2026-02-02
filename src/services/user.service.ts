import prisma from "../lib/prisma";
import { NotFoundError } from "../utils/AppError";
import type { UpdateProfileInput } from "../validations/user.validation";

// ═══════════════════════════════════════════════════════════
// USER SERVICE
// Business logic for user profile management
// ═══════════════════════════════════════════════════════════

/**
 * Get user profile by ID
 */
export const getProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            emailVerified: true,
            address: true,
            phone: true,
            createdAt: true,
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
 * Update user profile
 */
export const updateProfile = async (userId: string, data: UpdateProfileInput) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData["name"] = data.name;
    if (data.image !== undefined) updateData["image"] = data.image;
    if (data.address !== undefined) updateData["address"] = data.address;
    if (data.phone !== undefined) updateData["phone"] = data.phone;

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            emailVerified: true,
            address: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
};

/**
 * Get user's order history with summary
 */
export const getOrderHistory = async (userId: string) => {
    const orders = await prisma.order.findMany({
        where: { customerId: userId },
        include: {
            orderItems: {
                include: {
                    meal: {
                        select: { id: true, name: true, image: true },
                    },
                },
            },
            providerProfile: {
                select: { id: true, businessName: true, logo: true },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
    });

    // Calculate summary
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const ordersByStatus = orders.reduce(
        (acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return {
        orders,
        summary: {
            totalOrders: orders.length,
            totalSpent,
            ordersByStatus,
        },
    };
};

/**
 * Get user dashboard stats
 */
export const getDashboardStats = async (userId: string) => {
    const [orderStats, reviewCount, recentOrders] = await Promise.all([
        prisma.order.aggregate({
            where: { customerId: userId },
            _count: true,
            _sum: { totalAmount: true },
        }),
        prisma.review.count({ where: { userId } }),
        prisma.order.findMany({
            where: { customerId: userId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                providerProfile: {
                    select: { businessName: true },
                },
            },
        }),
    ]);

    return {
        totalOrders: orderStats._count,
        totalSpent: Number(orderStats._sum.totalAmount) || 0,
        totalReviews: reviewCount,
        recentOrders: recentOrders.map((order) => ({
            id: order.id,
            status: order.status,
            totalAmount: order.totalAmount,
            providerName: order.providerProfile.businessName,
            createdAt: order.createdAt,
        })),
    };
};
