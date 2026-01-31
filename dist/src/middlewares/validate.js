import { ZodError } from "zod";
import { ValidationError } from "../utils/AppError";
export const validate = (schema, options = { target: "body" }) => {
    return (req, res, next) => {
        try {
            const target = options.target || "body";
            const dataToValidate = req[target];
            // Parse and validate
            const result = schema.safeParse(dataToValidate);
            if (!result.success) {
                // Convert Zod errors to our format
                const errors = {};
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
            }
            else {
                // Store in res.locals for query/params (read-only properties)
                res.locals["validated" + target.charAt(0).toUpperCase() + target.slice(1)] = result.data;
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = {};
                error.issues.forEach((err) => {
                    const field = err.path.join(".") || "value";
                    if (!errors[field]) {
                        errors[field] = [];
                    }
                    errors[field].push(err.message);
                });
                next(new ValidationError(errors));
            }
            else {
                next(error);
            }
        }
    };
};
// ═══════════════════════════════════════════════════════════
// SHORTHAND VALIDATORS
// ═══════════════════════════════════════════════════════════
export const validateBody = (schema) => validate(schema, { target: "body" });
export const validateQuery = (schema) => validate(schema, { target: "query" });
export const validateParams = (schema) => validate(schema, { target: "params" });
//# sourceMappingURL=validate.js.map