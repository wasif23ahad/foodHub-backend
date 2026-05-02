import "dotenv/config";

export const config = {
    // Server
    port: parseInt(process.env["PORT"] ?? "5000", 10),
    nodeEnv: process.env["NODE_ENV"] ?? "development",

    // Database
    databaseUrl: process.env["DATABASE_URL"] || "",
    directUrl: process.env["DIRECT_URL"] || "",

    // JWT Secret
    jwtSecret: process.env["JWT_SECRET"] ?? "your-secret-key-change-this-in-production",

    // CORS
    frontendUrl: (process.env["FRONTEND_URL"] || "https://foodhub-frontend-sand.vercel.app").replace(/\/$/, ""),


    // Admin Seed
    adminEmail: process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com",
    adminPassword: process.env["ADMIN_PASSWORD"] ?? "admin123",

    // Cloudinary Integration
    cloudinaryCloudName: process.env["CLOUDINARY_CLOUD_NAME"] ?? "",
    cloudinaryApiKey: process.env["CLOUDINARY_API_KEY"] ?? "",
    cloudinaryApiSecret: process.env["CLOUDINARY_API_SECRET"] ?? "",

    // Social Auth
    googleClientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
    googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"] ?? "",

    // AI - configurable free-model providers
    cravelyProvider: process.env["CRAVELY_PROVIDER"] ?? "auto",
    cravelyGeminiModel: process.env["CRAVELY_GEMINI_MODEL"] ?? "gemini-2.0-flash",
    cravelyNvidiaModel: process.env["CRAVELY_NVIDIA_MODEL"] ?? "stepfun-ai/step-3.5-flash",

    // SSLCommerz
    sslcommerzStoreId: process.env["STORE_ID"] ?? "",
    sslcommerzStorePassword: process.env["STORE_PASSWORD"] ?? "",
    sslcommerzIsLive: process.env["IS_LIVE"] === "true",
} as const;

// Required env vars are validated at server startup (server.ts), not at import,
// so Vercel build can succeed even when build env has no DATABASE_URL.
