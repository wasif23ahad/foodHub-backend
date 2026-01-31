import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// PROVIDER PROFILE VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════

// Create provider profile schema
export const createProviderProfileSchema = z.object({
    businessName: z
        .string()
        .min(2, "Business name must be at least 2 characters")
        .max(100, "Business name must be at most 100 characters"),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    address: z.string().max(255, "Address must be at most 255 characters").optional(),
    phone: z
        .string()
        .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")
        .optional(),
    cuisineType: z.string().max(50, "Cuisine type must be at most 50 characters").optional(),
    contactEmail: z.string().email("Invalid email format").optional(),
});

// Update provider profile schema (all fields optional)
export const updateProviderProfileSchema = z.object({
    businessName: z
        .string()
        .min(2, "Business name must be at least 2 characters")
        .max(100, "Business name must be at most 100 characters")
        .optional(),
    description: z
        .string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
    logo: z.string().url("Logo must be a valid URL").optional(),
    address: z.string().max(255, "Address must be at most 255 characters").optional(),
    phone: z
        .string()
        .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")
        .optional(),
    cuisineType: z.string().max(50, "Cuisine type must be at most 50 characters").optional(),
    contactEmail: z.string().email("Invalid email format").optional(),
    isActive: z.boolean().optional(),
});

// Types inferred from schemas
export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
