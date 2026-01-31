import type { UserListQueryInput, BanUserInput, AdminOrderQueryInput } from "../validations/admin.validation";
/**
 * Get all users with filters and pagination
 */
export declare const getUsers: (query: UserListQueryInput) => Promise<{
    users: {
        role: import("../../generated/prisma/enums").Role;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        name: string;
        image: string | null;
        banReason: string | null;
        banned: boolean | null;
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Get user by ID with detailed info
 */
export declare const getUserById: (userId: string) => Promise<{
    role: import("../../generated/prisma/enums").Role;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    name: string;
    image: string | null;
    banReason: string | null;
    banned: boolean | null;
    providerProfile: {
        id: string;
        createdAt: Date;
        businessName: string;
    } | null;
    _count: {
        orders: number;
        reviews: number;
    };
}>;
/**
 * Ban a user
 */
export declare const banUser: (adminId: string, userId: string, data: BanUserInput) => Promise<{
    role: import("../../generated/prisma/enums").Role;
    id: string;
    updatedAt: Date;
    email: string;
    name: string;
    banReason: string | null;
    banned: boolean | null;
}>;
/**
 * Get all orders for admin monitoring
 */
export declare const getAllOrders: (query: AdminOrderQueryInput) => Promise<{
    orders: ({
        providerProfile: {
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            businessName: string;
            description: string | null;
            logo: string | null;
            address: string | null;
            phone: string | null;
            cuisineType: string | null;
            contactEmail: string | null;
            isActive: boolean;
        };
        orderItems: ({
            meal: {
                id: string;
                name: string;
                price: number;
            };
        } & {
            id: string;
            createdAt: Date;
            mealId: string;
            quantity: number;
            orderId: string;
            unitPrice: number;
        })[];
        customer: {
            id: string;
            email: string;
            name: string;
        };
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
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Get dashboard statistics
 */
export declare const getDashboardStats: () => Promise<{
    totalUsers: number;
    totalProviders: number;
    totalOrders: number;
    totalMeals: number;
    ordersByStatus: Record<string, number>;
    recentOrders: ({
        customer: {
            name: string;
        };
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
}>;
//# sourceMappingURL=admin.service.d.ts.map