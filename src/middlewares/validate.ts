import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/AppError";

// ═══════════════════════════════════════════════════════════
// ZOD VALIDATION MIDDLEWARE
// Validates request body, query, or params against a Zod schema
// ═══════════════════════════════════════════════════════════

type ValidationTarget = "body" | "query" | "params";

interface ValidateOptions {
    target?: ValidationTarget;
}

export const validate = (
    schema: ZodSchema,
    options: ValidateOptions = { target: "body" }
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const target = options.target || "body";
            const dataToValidate = req[target];

            // Parse and validate
            const result = schema.safeParse(dataToValidate);

            if (!result.success) {
                // Convert Zod errors to our format
                const errors: Record<string, string[]> = {};

                result.error.issues.forEach((err) => {
                    const field = err.path.join(".") || "value";
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(err.message);
                });

                throw new ValidationError(errors);
            }

            // Store validated data appropriately
            // body can be replaced, query/params are read-only in Express 5
            if (target === "body") {
                req.body = result.data;
            } else {
                // Store in res.locals for query/params (read-only properties)
                res.locals["validated" + target.charAt(0).toUpperCase() + target.slice(1)] = result.data;
            }

            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors: Record<string, string[]> = {};
                error.issues.forEach((err) => {
                    const field = err.path.join(".") || "value";
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(err.message);
                });
                next(new ValidationError(errors));
            } else {
                next(error);
            }
        }
    };
};

// ═══════════════════════════════════════════════════════════
// SHORTHAND VALIDATORS
// ═══════════════════════════════════════════════════════════

export const validateBody = (schema: ZodSchema) => validate(schema, { target: "body" });
export const validateQuery = (schema: ZodSchema) => validate(schema, { target: "query" });
export const validateParams = (schema: ZodSchema) => validate(schema, { target: "params" });

