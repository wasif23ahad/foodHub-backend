import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { UnauthorizedError } from "../utils/AppError";

import "../types";

export const requireAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session || !session.user) {
            throw new UnauthorizedError("Authentication required");
        }

        if (session.user.banned) {
            throw new UnauthorizedError(
                session.user.banReason || "Your account has been suspended"
            );
        }

        req.user = session.user as any;
        req.session = session.session as any;

        next();
    } catch (error) {
        next(error);
    }
};
