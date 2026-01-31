import app from "./app";
import { config } from "./config";
import prisma from "./lib/prisma";

// ======================
// SERVER STARTUP
// ======================

async function startServer() {
    try {
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

// Handle graceful shutdown
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

// Start the server
startServer();
