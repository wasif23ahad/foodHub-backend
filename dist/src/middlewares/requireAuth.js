import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { UnauthorizedError } from "../utils/AppError";
// Import types
import "../types";
// ═══════════════════════════════════════════════════════════
// REQUIRE AUTH MIDDLEWARE
// Verifies the user is logged in (has valid session)
// ═══════════════════════════════════════════════════════════
export const requireAuth = async (req, _res, next) => {
    try {
        // Get session from BetterAuth
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session || !session.user) {
            throw new UnauthorizedError("Authentication required");
        }
        // Check if user is banned
        if (session.user.banned) {
            throw new UnauthorizedError(session.user.banReason || "Your account has been suspended");
        }
        // Attach user and session to request
        req.user = session.user;
        req.session = session.session;
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=requireAuth.js.map