import type { CreateCategoryInput, UpdateCategoryInput, CategoryQueryInput } from "../validations/category.validation";
/**
 * Get all categories with optional filters
 */
export declare const getCategories: (query: CategoryQueryInput) => Promise<{
    categories: ({
        _count: {
            meals: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        image: string | null;
        description: string | null;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Get category by ID
 */
export declare const getCategoryById: (categoryId: string) => Promise<{
    _count: {
        meals: number;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    image: string | null;
    description: string | null;
}>;
/**
 * Create a new category (Admin only)
 */
export declare const createCategory: (data: CreateCategoryInput) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    image: string | null;
    description: string | null;
}>;
/**
 * Update a category (Admin only)
 */
export declare const updateCategory: (categoryId: string, data: UpdateCategoryInput) => Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    image: string | null;
    description: string | null;
}>;
/**
 * Delete a category (Admin only)
 */
export declare const deleteCategory: (categoryId: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=category.service.d.ts.map