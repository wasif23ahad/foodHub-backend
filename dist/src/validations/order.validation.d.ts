import { z } from "zod";
declare const OrderStatusValues: readonly ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
type OrderStatusType = typeof OrderStatusValues[number];
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        mealId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    deliveryAddress: z.ZodString;
    deliveryNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        PLACED: "PLACED";
        PREPARING: "PREPARING";
        READY: "READY";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
    }>;
}, z.core.$strip>;
export declare const orderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PLACED: "PLACED";
        PREPARING: "PREPARING";
        READY: "READY";
        DELIVERED: "DELIVERED";
        CANCELLED: "CANCELLED";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const orderIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type OrderStatusEnum = OrderStatusType;
export {};
//# sourceMappingURL=order.validation.d.ts.map