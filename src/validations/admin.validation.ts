import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// ADMIN VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════

// Role values from Prisma schema
const RoleValues = ["CUSTOMER", "PROVIDER", "ADMIN"] as const;

// Query schema for listing users with filters
export const userListQuerySchema = z.object({
    role: z.enum(RoleValues).optional(),
    search: z.string().optional(),
    isBanned: z.coerce.boolean().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

// Ban/unban user schema
export const banUserSchema = z.object({
    banned: z.boolean(),
    banReason: z.string().max(500, "Ban reason is too long").optional(),
});

// User ID param schema
export const userIdParamSchema = z.object({
    id: z.string().cuid("Invalid user ID"),
});

// Provider ID param schema
export const providerIdParamSchema = z.object({
    id: z.string().cuid("Invalid provider ID"),
});

// Order query schema for admin
export const adminOrderQuerySchema = z.object({
    status: z.enum(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
    providerId: z.string().cuid().optional(),
    customerId: z.string().cuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});

// Types inferred from schemas
export type UserListQueryInput = z.infer<typeof userListQuerySchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;
