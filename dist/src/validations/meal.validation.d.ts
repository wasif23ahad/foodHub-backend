import { z } from "zod";
export declare const createMealSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodNumber;
    image: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodString;
    isAvailable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateMealSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    image: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    isAvailable: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const mealQuerySchema: z.ZodObject<{
    categoryId: z.ZodOptional<z.ZodString>;
    providerId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    isAvailable: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        rating: "rating";
        price_asc: "price_asc";
        price_desc: "price_desc";
        newest: "newest";
        oldest: "oldest";
        popular: "popular";
    }>>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const mealIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateMealInput = z.infer<typeof createMealSchema>;
export type UpdateMealInput = z.infer<typeof updateMealSchema>;
export type MealQueryInput = z.infer<typeof mealQuerySchema>;
//# sourceMappingURL=meal.validation.d.ts.map