import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import prisma from "../lib/prisma";

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.token;
        
        let token = cookieToken;
        
        if (!token && authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                providerProfile: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        if (user.banned) {
            return res.status(403).json({ message: `Account banned: ${user.banReason || "No reason provided"}` });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
};

export const roleMiddleware = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }

        next();
    };
};
