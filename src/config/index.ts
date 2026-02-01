import "dotenv/config";

export const config = {
    // Server
    port: parseInt(process.env["PORT"] ?? "5000", 10),
    nodeEnv: process.env["NODE_ENV"] ?? "development",

    // Database
    databaseUrl: process.env["DATABASE_URL"]!,

    // BetterAuth
    betterAuthSecret: process.env["BETTER_AUTH_SECRET"]!,
    betterAuthUrl: process.env["BETTER_AUTH_URL"] ?? "http://localhost:5000",

    // CORS
    frontendUrl: process.env["FRONTEND_URL"] ?? "http://localhost:3000",

    // Google Auth
    googleClientId: process.env["GOOGLE_CLIENT_ID"],
    googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"],

    // Admin Seed
    adminEmail: process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com",
    adminPassword: process.env["ADMIN_PASSWORD"] ?? "admin123",
} as const;

// Validate required env vars
const requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
