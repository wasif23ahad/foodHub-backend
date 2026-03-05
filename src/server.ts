import app from "./app";
import { config } from "./config";
import prisma from "./lib/prisma";

// ======================
// SERVER STARTUP
// ======================

async function startServer() {
    try {
        // Validate required env at runtime (not at config import, so Vercel build can succeed)
        const required = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
        for (const key of required) {
            if (!process.env[key]) {
                throw new Error(`Missing required environment variable: ${key}`);
            }
        }
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log("✅ Database connected successfully");

        // Start listening
        app.listen(config.port, () => {
            console.log(`
🍱 FoodHub API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server:      http://localhost:${config.port}
🏥 Health:      http://localhost:${config.port}/health
🌍 Environment: ${config.nodeEnv}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

// Handle graceful shutdown - only in non-Vercel environment
if (process.env["VERCEL"] !== "1") {
    process.on("SIGINT", async () => {
        console.log("\n🛑 Shutting down gracefully...");
        await prisma.$disconnect();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n🛑 Shutting down gracefully...");
        await prisma.$disconnect();
        process.exit(0);
    });

    startServer();
}

// Export for Vercel serverless
export default app;

