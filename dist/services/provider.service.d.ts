import type { CreateProviderProfileInput, UpdateProviderProfileInput } from "../validations/provider.validation";
/**
 * Get provider profile by user ID
 */
export declare const getProfileByUserId: (userId: string) => Promise<{
    user: {
        id: string;
        email: string;
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
}>;
/**
 * Create provider profile
 */
export declare const createProfile: (userId: string, data: CreateProviderProfileInput) => Promise<{
    user: {
        id: string;
        email: string;
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
}>;
/**
 * Update provider profile
 */
export declare const updateProfile: (userId: string, data: UpdateProviderProfileInput) => Promise<{
    user: {
        id: string;
        email: string;
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
}>;
/**
 * Get provider profile by ID with full details (public)
 */
export declare const getProfileById: (profileId: string) => Promise<{
    avgRating: number;
    totalReviews: number;
    user: {
        id: string;
        name: string;
        image: string | null;
    };
    meals: ({
        _count: {
            reviews: number;
            orderItems: number;
        };
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            image: string | null;
            description: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        description: string | null;
        providerProfileId: string;
        categoryId: string;
        price: number;
        isAvailable: boolean;
        preparationTime: number | null;
    })[];
    _count: {
        meals: number;
        orders: number;
    };
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
}>;
type ProviderQueryInput = {
    search?: string;
    cuisineType?: string;
    page: number;
    limit: number;
};
/**
 * Get all active providers with filters (public)
 */
export declare const getAllProviders: (query: ProviderQueryInput) => Promise<{
    providers: {
        avgRating: number;
        totalReviews: number;
        user: {
            id: string;
            name: string;
            image: string | null;
        };
        _count: {
            meals: number;
            orders: number;
        };
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
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
export {};
//# sourceMappingURL=provider.service.d.ts.map