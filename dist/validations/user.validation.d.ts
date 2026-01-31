import { z } from "zod";
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
//# sourceMappingURL=user.validation.d.ts.map