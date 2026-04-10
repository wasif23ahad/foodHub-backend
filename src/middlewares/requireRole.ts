import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";

import "../types";

export const requireRole = (...allowedRoles: Role[]) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!req.user) {
                throw new UnauthorizedError("Authentication required");
            }

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

export const requireAdmin = requireRole(Role.ADMIN);
export const requireProvider = requireRole(Role.PROVIDER);
export const requireCustomer = requireRole(Role.CUSTOMER);
