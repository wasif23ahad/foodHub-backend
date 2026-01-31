import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// MEAL VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════

// Sort options for meals
const SortOptions = ["price_asc", "price_desc", "newest", "oldest", "rating", "popular"] as const;

// Create meal schema
export const createMealSchema = z.object({
    name: z
        .string()
        .min(2, "Meal name must be at least 2 characters")
        .max(100, "Meal name must be at most 100 characters"),
    description: z
        .string()
        .max(1000, "Description must be at most 1000 characters")
        .optional(),
    price: z
        .number()
        .positive("Price must be a positive number")
        .max(99999.99, "Price is too high"),
    image: z.string().url("Image must be a valid URL").optional(),
    categoryId: z.string().cuid("Invalid category ID"),
    isAvailable: z.boolean().optional().default(true),
});

// Update meal schema (all fields optional except validation rules)
export const updateMealSchema = z.object({
    name: z
        .string()
        .min(2, "Meal name must be at least 2 characters")
        .max(100, "Meal name must be at most 100 characters")
        .optional(),
    description: z
        .string()
        .max(1000, "Description must be at most 1000 characters")
        .optional(),
    price: z
        .number()
        .positive("Price must be a positive number")
        .max(99999.99, "Price is too high")
        .optional(),
    image: z.string().url("Image must be a valid URL").optional(),
    categoryId: z.string().cuid("Invalid category ID").optional(),
    isAvailable: z.boolean().optional(),
});

// Query schema for filtering meals (Public API)
export const mealQuerySchema = z.object({
    categoryId: z.string().cuid().optional(),
    providerId: z.string().cuid().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    isAvailable: z.coerce.boolean().optional(),
    sort: z.enum(SortOptions).optional().default("newest"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

// ID param schema
export const mealIdParamSchema = z.object({
    id: z.string().cuid("Invalid meal ID"),
});

// Types inferred from schemas
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type MealQueryInput = z.infer<typeof mealQuerySchema>;

