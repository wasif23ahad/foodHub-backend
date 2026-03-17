import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Workaround for Neon DB timeout issues in local dev
const databaseUrl = process.env["DATABASE_URL"]?.replace("&channel_binding=require", "") || process.env["DATABASE_URL"];

if (!databaseUrl && process.env["NODE_ENV"] === "production") {
    console.warn("⚠️ DATABASE_URL is missing in production environment!");
}

if (databaseUrl) {
    process.env["DATABASE_URL"] = databaseUrl;
}

let prisma: PrismaClient;

try {
    if (databaseUrl) {
        const pool = new Pool({
            connectionString: databaseUrl,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            ssl: { rejectUnauthorized: false }
        });
        // @ts-ignore
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    } else {
        prisma = new PrismaClient();
    }
} catch (error) {
    console.error("❌ Prisma initialization error:", error);
    prisma = new PrismaClient();
}

export default prisma;
