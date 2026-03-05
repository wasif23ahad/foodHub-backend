import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl && process.env["NODE_ENV"] === "production") {
    console.warn("⚠️ DATABASE_URL is missing in production environment!");
}

let prisma: PrismaClient;

if (databaseUrl) {
    const pool = new Pool({
        connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
} else {
    // Fallback for build time or missing env cases
    prisma = new PrismaClient();
    console.warn("⚠️ DATABASE_URL is missing. Prisma initialized without driver adapter.");
}

export default prisma;
