import jwt from "jsonwebtoken";
import { config } from "../config";
import { JWTPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export const signToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as JWTPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.warn("JWT Token expired");
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.warn("JWT Token invalid");
        }
        return null;
    }
};
