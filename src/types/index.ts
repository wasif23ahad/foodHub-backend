import { Role } from "../../generated/prisma/client";

// ═══════════════════════════════════════════════════════════
// EXTEND EXPRESS REQUEST TYPE
// ═══════════════════════════════════════════════════════════

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: Role;
    emailVerified: boolean;
    image?: string | null;
    banned?: boolean | null;
    banReason?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthSession {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
}

// Extend Express Request
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
            session?: AuthSession;
        }
    }
}

export { };
