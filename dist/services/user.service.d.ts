import type { UpdateProfileInput } from "../validations/user.validation";
/**
 * Get user profile by ID
 */
export declare const getProfile: (userId: string) => Promise<{
    role: import("../../generated/prisma/enums").Role;
    id: string;
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image: string | null;
    _count: {
        orders: number;
        reviews: number;
    };
}>;
/**
 * Update user profile
 */
export declare const updateProfile: (userId: string, data: UpdateProfileInput) => Promise<{
    role: import("../../generated/prisma/enums").Role;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image: string | null;
}>;
/**
 * Get user's order history with summary
 */
export declare const getOrderHistory: (userId: string) => Promise<{
    orders: ({
        providerProfile: {
            id: string;
            businessName: string;
            logo: string | null;
        };
        orderItems: ({
            meal: {
                id: string;
                name: string;
                image: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            mealId: string;
            quantity: number;
            orderId: string;
            unitPrice: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        providerProfileId: string;
        deliveryAddress: string;
        deliveryNotes: string | null;
        status: import("../../generated/prisma/enums").OrderStatus;
        customerId: string;
        totalAmount: number;
    })[];
    summary: {
        totalOrders: number;
        totalSpent: number;
        ordersByStatus: Record<string, number>;
    };
}>;
/**
 * Get user dashboard stats
 */
export declare const getDashboardStats: (userId: string) => Promise<{
    totalOrders: number;
    totalSpent: number;
    totalReviews: number;
    recentOrders: {
        id: string;
        status: import("../../generated/prisma/enums").OrderStatus;
        totalAmount: number;
        providerName: string;
        createdAt: Date;
    }[];
}>;
//# sourceMappingURL=user.service.d.ts.map