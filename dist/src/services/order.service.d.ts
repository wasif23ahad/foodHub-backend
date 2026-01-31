import type { CreateOrderInput, UpdateOrderStatusInput, OrderQueryInput } from "../validations/order.validation";
/**
 * Get provider's orders (Provider only)
 */
export declare const getProviderOrders: (providerId: string, query: OrderQueryInput) => Promise<{
    orders: ({
        orderItems: ({
            meal: {
                id: string;
                name: string;
                image: string | null;
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
 * Get order by ID for provider (Provider only)
 */
export declare const getProviderOrderById: (orderId: string, providerId: string) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    orderItems: ({
        meal: {
            id: string;
            name: string;
            image: string | null;
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
    providerProfileId: string;
    deliveryAddress: string;
    deliveryNotes: string | null;
    status: import("../../generated/prisma/enums").OrderStatus;
    customerId: string;
    totalAmount: number;
    customer: {
        id: string;
        email: string;
        name: string;
        image: string | null;
    };
}>;
/**
 * Update order status (Provider only)
 */
export declare const updateOrderStatus: (orderId: string, providerId: string, data: UpdateOrderStatusInput) => Promise<{
    orderItems: ({
        meal: {
            id: string;
            name: string;
            image: string | null;
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
}>;
/**
 * Create order (Customer only)
 */
export declare const createOrder: (userId: string, data: CreateOrderInput) => Promise<{
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
            image: string | null;
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
}>;
/**
 * Get customer's orders (Customer only)
 */
export declare const getCustomerOrders: (userId: string, query: OrderQueryInput) => Promise<{
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
                image: string | null;
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
 * Get order by ID for customer (Customer only)
 */
export declare const getCustomerOrderById: (orderId: string, userId: string) => Promise<{
    providerProfile: {
        user: {
            id: string;
            name: string;
            image: string | null;
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
            image: string | null;
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
}>;
//# sourceMappingURL=order.service.d.ts.map