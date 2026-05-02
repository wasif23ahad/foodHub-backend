import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { config } from "../config";
import { JWTPayload } from "../types";
import { 
    sendSuccess, 
    sendCreated, 
    sendError, 
    sendUnauthorized, 
    sendForbidden, 
    sendBadRequest, 
    setAuthCookie, 
    clearAuthCookie 
} from "../utils/response.util";

const googleClient = new OAuth2Client(config.googleClientId);

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return sendBadRequest(res, "Missing required fields");
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return sendBadRequest(res, "User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                role: role || "CUSTOMER",
                accounts: {
                    create: {
                        providerId: "credential",
                        accountId: email,
                        password: hashedPassword,
                    },
                },
            },
        });

        const payload: JWTPayload = { id: user.id, email: user.email, role: user.role };
        const token = signToken(payload);

        setAuthCookie(res, token);

        return sendCreated(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }, "Registration successful");
    } catch (error) {
        console.error("Register error:", error);
        return sendError(res, "Internal server error");
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return sendBadRequest(res, "Missing email or password");
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: {
                    where: { providerId: "credential" },
                },
            },
        });

        if (!user || !user.accounts[0]?.password) {
            return sendUnauthorized(res, "Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.accounts[0].password);

        if (!isPasswordValid) {
            return sendUnauthorized(res, "Invalid credentials");
        }

        if (user.banned) {
            return sendForbidden(res, `Account is banned: ${user.banReason || "No reason provided"}`);
        }

        const payload: JWTPayload = { id: user.id, email: user.email, role: user.role };
        const token = signToken(payload);

        setAuthCookie(res, token);

        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }, "Login successful");
    } catch (error) {
        console.error("Login error:", error);
        return sendError(res, "Internal server error");
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ message: "Missing Google ID token" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.googleClientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google token" });
        }

        let user = await prisma.user.findUnique({
            where: { email: payload.email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || payload.email,
                    image: payload.picture || null,
                    role: "CUSTOMER",
                    accounts: {
                        create: {
                            providerId: "google",
                            accountId: payload.sub,
                        },
                    },
                },
            });
        } else {
            // Check if google account already linked
            const existingAccount = await prisma.account.findFirst({
                where: {
                    userId: user.id,
                    providerId: "google",
                },
            });

            if (!existingAccount) {
                await prisma.account.create({
                    data: {
                        userId: user.id,
                        providerId: "google",
                        accountId: payload.sub,
                    },
                });
            }
        }

        if (user.banned) {
            return res.status(403).json({ message: "Account is banned" });
        }

        const jwtPayload: JWTPayload = { id: user.id, email: user.email, role: user.role };
        const token = signToken(jwtPayload);

        setAuthCookie(res, token);

        return sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            token,
        }, "Google login successful");
    } catch (error) {
        console.error("Google login error:", error);
        return sendError(res, "Internal server error");
    }
};

export const logout = (req: Request, res: Response) => {
    clearAuthCookie(res);
    return sendSuccess(res, null, "Logged out successfully");
};

export const getMe = async (req: any, res: Response) => {
    if (!req.user) {
        return sendUnauthorized(res, "Not authenticated");
    }
    return sendSuccess(res, { user: req.user }, "User profile fetched successfully");
};
