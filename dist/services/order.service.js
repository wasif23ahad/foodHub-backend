import prisma from "../lib/prisma";
import { NotFoundError, ForbiddenError, BadRequestError } from "../utils/AppError";
// ═══════════════════════════════════════════════════════════
// ORDER SERVICE
// Business logic for order management
// ═══════════════════════════════════════════════════════════
// Valid status transitions for providers
const VALID_STATUS_TRANSITIONS = {
    PLACED: ["PREPARING", "CANCELLED"],
    PREPARING: ["READY", "CANCELLED"],
    READY: ["DELIVERED"],
    DELIVERED: [], // Terminal state
    CANCELLED: [], // Terminal state
};
/**
 * Get provider's orders (Provider only)
 */
export const getProviderOrders = async (providerId, query) => {
    const { status, page, limit } = query;
    const where = {
        providerProfile: { id: providerId },
    };
    if (status) {
        where["status"] = status;
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                orderItems: {
                    include: {
                        meal: {
                            select: { id: true, name: true, price: true, image: true },
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
 * Get order by ID for provider (Provider only)
 */
export const getProviderOrderById = async (orderId, providerId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
            id: true,
            customerId: true,
            providerProfileId: true,
            status: true,
            totalAmount: true,
            deliveryAddress: true,
            deliveryNotes: true,
            createdAt: true,
            updatedAt: true,
            customer: {
                select: { id: true, name: true, email: true, image: true },
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
    if (order.providerProfileId !== providerId) {
        throw new ForbiddenError("You can only view your own orders");
    }
    return order;
};
/**
 * Update order status (Provider only)
 */
export const updateOrderStatus = async (orderId, providerId, data) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            providerProfile: {
                select: { id: true },
            },
        },
    });
    if (!order) {
        throw new NotFoundError("Order not found");
    }
    if (order.providerProfile.id !== providerId) {
        throw new ForbiddenError("You can only update your own orders");
    }
    // Validate status transition
    const currentStatus = order.status;
    const newStatus = data.status;
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!validTransitions.includes(newStatus)) {
        throw new BadRequestError(`Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(", ") || "none (terminal state)"}`);
    }
    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
            customer: {
                select: { id: true, name: true, email: true },
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
    return updatedOrder;
};
/**
 * Create order (Customer only)
 */
export const createOrder = async (userId, data) => {
    // Get all meals from the order items
    const mealIds = data.items.map((item) => item.mealId);
    const meals = await prisma.meal.findMany({
        where: {
            id: { in: mealIds },
            isAvailable: true,
        },
        include: {
            providerProfile: true,
        },
    });
    if (meals.length !== mealIds.length) {
        throw new BadRequestError("One or more meals are not available");
    }
    // Check all meals are from the same provider
    const providerIds = new Set(meals.map((m) => m.providerProfileId));
    if (providerIds.size > 1) {
        throw new BadRequestError("All items must be from the same provider");
    }
    const providerId = meals[0].providerProfileId;
    // Calculate order total and create order items data
    let totalAmount = 0;
    const orderItemsData = data.items.map((item) => {
        const meal = meals.find((m) => m.id === item.mealId);
        const itemTotal = Number(meal.price) * item.quantity;
        totalAmount += itemTotal;
        return {
            mealId: item.mealId,
            quantity: item.quantity,
            unitPrice: meal.price,
        };
    });
    // Create order with items in a transaction
    const order = await prisma.order.create({
        data: {
            customerId: userId,
            providerProfileId: providerId,
            totalAmount,
            deliveryAddress: data.deliveryAddress,
            deliveryNotes: data.deliveryNotes ?? null,
            status: "PLACED",
            orderItems: {
                create: orderItemsData,
            },
        },
        include: {
            orderItems: {
                include: {
                    meal: {
                        select: { id: true, name: true, price: true, image: true },
                    },
                },
            },
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true },
                    },
                },
            },
        },
    });
    return order;
};
/**
 * Get customer's orders (Customer only)
 */
export const getCustomerOrders = async (userId, query) => {
    const { status, page, limit } = query;
    const where = {
        customerId: userId,
    };
    if (status) {
        where["status"] = status;
    }
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
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
                            select: { id: true, name: true, price: true, image: true },
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
 * Get order by ID for customer (Customer only)
 */
export const getCustomerOrderById = async (orderId, userId) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            providerProfile: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
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
    if (order.customerId !== userId) {
        throw new ForbiddenError("You can only view your own orders");
    }
    return order;
};
//# sourceMappingURL=order.service.js.map