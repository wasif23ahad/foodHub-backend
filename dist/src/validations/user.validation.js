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
    image: z.string().url("Image must be a valid URL").nullable().optional(),
});
//# sourceMappingURL=user.validation.js.map