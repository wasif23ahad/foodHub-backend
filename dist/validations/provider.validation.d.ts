import { z } from "zod";
export declare const createProviderProfileSchema: z.ZodObject<{
    businessName: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    cuisineType: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateProviderProfileSchema: z.ZodObject<{
    businessName: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    logo: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    cuisineType: z.ZodOptional<z.ZodString>;
    contactEmail: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
//# sourceMappingURL=provider.validation.d.ts.map