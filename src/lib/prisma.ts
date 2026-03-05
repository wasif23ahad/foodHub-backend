import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl && process.env["NODE_ENV"] === "production") {
    console.warn("⚠️ DATABASE_URL is missing in production environment!");
}

let prisma: PrismaClient;

try {
    if (databaseUrl) {
        const pool = new Pool({
            connectionString: databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    } else {
        prisma = new PrismaClient();
        if (process.env["NODE_ENV"] === "production") {
            console.error("❌ DATABASE_URL is missing in production!");
        }
    }
} catch (error) {
    console.error("❌ Prisma initialization error:", error);
    // Absolute fallback: a plain client that might fail during requests but won't crash the module load
    prisma = new PrismaClient();
}

export default prisma;
