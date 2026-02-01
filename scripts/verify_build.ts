
import { Role } from "../generated/prisma/client";
import prisma from "../src/lib/prisma";

console.log("✅ Importing Prisma Client successful");

try {
    console.log("✅ Prisma Client instantiated");
    if (Role.ADMIN) {
        console.log("✅ Role Enum loaded: " + Role.ADMIN);
    }
} catch (e) {
    console.error("❌ Prisma Error:", e);
}
