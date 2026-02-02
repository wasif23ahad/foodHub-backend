import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// USER PROFILE VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════

// Update profile schema
export const updateProfileSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be at most 100 characters")
        .optional(),
    image: z.union([z.string().url("Image must be a valid URL"), z.literal("")]).nullable().optional(),
    address: z.string().max(200, "Address must be at most 200 characters").optional().or(z.literal("")),
    phone: z.string().max(20, "Phone number must be at most 20 characters").optional().or(z.literal("")),
});

// Types inferred from schemas
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
