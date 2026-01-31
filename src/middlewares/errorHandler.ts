import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/response.util";
import { config } from "../config";

// ═══════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER MIDDLEWARE
// ═══════════════════════════════════════════════════════════

export const errorHandler = (
    err: Error | AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    // Log error in development
    if (config.nodeEnv === "development") {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("🔴 ERROR:", err.message);
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error(err.stack);
    }

    // Handle AppError (our custom errors)
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode, err.errors);
    }

    // Handle Prisma errors
    if (err.name === "PrismaClientKnownRequestError") {
        const prismaError = err as any;

        // Unique constraint violation
        if (prismaError.code === "P2002") {
            const field = prismaError.meta?.target?.[0] || "field";
            return sendError(res, `${field} already exists`, 409);
        }

        // Record not found
        if (prismaError.code === "P2025") {
            return sendError(res, "Record not found", 404);
        }
    }

    // Handle Zod validation errors
    if (err.name === "ZodError") {
        const zodError = err as any;
        const errors: Record<string, string[]> = {};

        zodError.errors.forEach((e: any) => {
            const field = e.path.join(".");
            if (!errors[field]) {
                errors[field] = [];
            }
            errors[field].push(e.message);
        });

        return sendError(res, "Validation failed", 400, errors);
    }

    // Handle JWT/Auth errors
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return sendError(res, "Invalid or expired token", 401);
    }

    // Default server error
    const message = config.nodeEnv === "development"
        ? err.message
        : "Internal server error";

    return sendError(res, message, 500);
};
