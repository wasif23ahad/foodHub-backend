import jwt from "jsonwebtoken";
import { config } from "../config";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

export const signToken = (payload: any): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
