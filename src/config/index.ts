import "dotenv/config";

export const config = {
    // Server
    port: parseInt(process.env["PORT"] ?? "5000", 10),
    nodeEnv: process.env["NODE_ENV"] ?? "development",

    // Database
    databaseUrl: process.env["DATABASE_URL"] || "",

    // BetterAuth
    betterAuthSecret: process.env["BETTER_AUTH_SECRET"] ?? "",
    betterAuthUrl: (process.env["BETTER_AUTH_URL"] || "https://foodhub-backend-silk.vercel.app").replace(/\/$/, "") + "/api/auth",

    // CORS
    frontendUrl: (process.env["FRONTEND_URL"] || "https://foodhub-frontend-sand.vercel.app").replace(/\/$/, ""),


    // Admin Seed
    adminEmail: process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com",
    adminPassword: process.env["ADMIN_PASSWORD"] ?? "admin123",

    // Social Auth
    googleClientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
    googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",
    facebookClientId: process.env["FACEBOOK_CLIENT_ID"] ?? "",
    facebookClientSecret: process.env["FACEBOOK_CLIENT_SECRET"] ?? "",
} as const;

// Required env vars are validated at server startup (server.ts), not at import,
// so Vercel build can succeed even when build env has no DATABASE_URL.
