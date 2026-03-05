import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString && process.env["NODE_ENV"] === "production") {
    console.warn("⚠️ DATABASE_URL is missing in production environment!");
}

const pool = new Pool({
    connectionString: connectionString || "",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
