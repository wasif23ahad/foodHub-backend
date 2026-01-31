import { z } from "zod";
// ═══════════════════════════════════════════════════════════
// PUBLIC PROVIDER VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════
// Query schema for listing providers
export const providerQuerySchema = z.object({
    search: z.string().optional(),
    cuisineType: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});
// Provider ID param schema
export const providerIdParamSchema = z.object({
    id: z.string().cuid("Invalid provider ID"),
});
//# sourceMappingURL=public-provider.validation.js.map