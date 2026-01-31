import { z } from "zod";
export declare const providerQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    cuisineType: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const providerIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type ProviderQueryInput = z.infer<typeof providerQuerySchema>;
//# sourceMappingURL=public-provider.validation.d.ts.map