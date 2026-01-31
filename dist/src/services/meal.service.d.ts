import type { CreateMealInput, UpdateMealInput, MealQueryInput } from "../validations/meal.validation";
/**
 * Create a new meal (Provider only)
 */
export declare const createMeal: (providerId: string, data: CreateMealInput) => Promise<{
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
}>;
/**
 * Get all meals with optional filters (Public)
 */
export declare const getMeals: (query: MealQueryInput) => Promise<{
    meals: {
        avgRating: number;
        reviewCount: number;
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
    }[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Get meal by ID with full details (Public)
 */
export declare const getMealById: (mealId: string) => Promise<{
    avgRating: number;
    totalReviews: number;
    totalOrders: number;
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
    reviews: ({
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
        rating: number;
        mealId: string;
        comment: string | null;
    })[];
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
}>;
/**
 * Update meal (Provider only - must own the meal)
 */
export declare const updateMeal: (mealId: string, providerId: string, data: UpdateMealInput) => Promise<{
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
}>;
/**
 * Delete meal (Provider only - must own the meal)
 */
export declare const deleteMeal: (mealId: string, providerId: string) => Promise<{
    message: string;
}>;
/**
 * Get provider's own meals
 */
export declare const getProviderMeals: (providerId: string) => Promise<({
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
})[]>;
//# sourceMappingURL=meal.service.d.ts.map