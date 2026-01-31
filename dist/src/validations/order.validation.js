import { z } from "zod";
// ═══════════════════════════════════════════════════════════
// ORDER VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════
// OrderStatus enum values from Prisma schema
const OrderStatusValues = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
// Order item for creating orders
const orderItemSchema = z.object({
    mealId: z.string().cuid("Invalid meal ID"),
    quantity: z.number().int().positive("Quantity must be a positive integer").max(100),
});
// Create order schema (for customers)
export const createOrderSchema = z.object({
    items: z
        .array(orderItemSchema)
        .min(1, "Order must contain at least one item")
        .max(50, "Order cannot contain more than 50 items"),
    deliveryAddress: z.string().max(500, "Delivery address is too long"),
    deliveryNotes: z.string().max(500, "Notes are too long").optional(),
});
// Update order status schema (for providers)
export const updateOrderStatusSchema = z.object({
    status: z.enum(OrderStatusValues, {
        message: "Invalid order status. Must be one of: PLACED, PREPARING, READY, DELIVERED, CANCELLED",
    }),
});
// Query schema for filtering orders
export const orderQuerySchema = z.object({
    status: z.enum(OrderStatusValues).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
});
// ID param schema
export const orderIdParamSchema = z.object({
    id: z.string().cuid("Invalid order ID"),
});
//# sourceMappingURL=order.validation.js.map