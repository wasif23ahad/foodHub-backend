import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// CATEGORY VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════

// Create category schema
export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
});

// Update category schema
export const updateCategorySchema = z.object({
    name: z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters")
        .optional(),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    image: z.string().url("Image must be a valid URL").nullable().optional(),
});

// Category ID param schema
export const categoryIdParamSchema = z.object({
    id: z.string().cuid("Invalid category ID"),
});

// Query schema for listing categories
export const categoryQuerySchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// Types inferred from schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
