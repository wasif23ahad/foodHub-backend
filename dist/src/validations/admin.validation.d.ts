import { z } from "zod";
export declare const userListQuerySchema: z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<{
        CUSTOMER: "CUSTOMER";
        ADMIN: "ADMIN";
        PROVIDER: "PROVIDER";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    isBanned: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const banUserSchema: z.ZodObject<{
    banned: z.ZodBoolean;
    banReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const providerIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const adminOrderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PLACED: "PLACED";
        PREPARING: "PREPARING";
        READY: "READY";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
    }>>;
    providerId: z.ZodOptional<z.ZodString>;
    customerId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;
//# sourceMappingURL=admin.validation.d.ts.map