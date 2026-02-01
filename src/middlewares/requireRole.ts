import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";

// Import types
import "../types";

// ═══════════════════════════════════════════════════════════
// REQUIRE ROLE MIDDLEWARE
// Checks if the authenticated user has the required role(s)
// Must be used AFTER requireAuth middleware
// ═══════════════════════════════════════════════════════════

export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                throw new UnauthorizedError("Authentication required");
            }

            // Check if user has one of the allowed roles
            const userRole = req.user.role as Role;

            if (!allowedRoles.includes(userRole)) {
                throw new ForbiddenError(
                    `Access denied. Required role: ${allowedRoles.join(" or ")}`
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// ═══════════════════════════════════════════════════════════
// SHORTHAND ROLE MIDDLEWARES
// ═══════════════════════════════════════════════════════════

export const requireAdmin = requireRole(Role.ADMIN);
export const requireProvider = requireRole(Role.PROVIDER, Role.ADMIN);
export const requireCustomer = requireRole(Role.CUSTOMER, Role.ADMIN);
