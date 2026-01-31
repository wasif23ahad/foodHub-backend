// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";

// src/config/index.ts
import "dotenv/config";
var config = {
  // Server
  port: parseInt(process.env["PORT"] ?? "5000", 10),
  nodeEnv: process.env["NODE_ENV"] ?? "development",
  // Database
  databaseUrl: process.env["DATABASE_URL"],
  // BetterAuth
  betterAuthSecret: process.env["BETTER_AUTH_SECRET"],
  betterAuthUrl: process.env["BETTER_AUTH_URL"] ?? "http://localhost:5000",
  // CORS
  frontendUrl: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
  // Admin Seed
  adminEmail: process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com",
  adminPassword: process.env["ADMIN_PASSWORD"] ?? "admin123"
};
var requiredEnvVars = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

// src/lib/prisma.ts
import "dotenv/config";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config2 = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": '// FoodHub Database Schema\n// Using BetterAuth with Prisma Adapter\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\n// ========================================\n// ENUMS\n// ========================================\n\nenum Role {\n  CUSTOMER\n  PROVIDER\n  ADMIN\n}\n\nenum OrderStatus {\n  PLACED\n  PREPARING\n  READY\n  DELIVERED\n  CANCELLED\n}\n\n// ========================================\n// BETTER AUTH TABLES\n// ========================================\n\nmodel user {\n  id            String    @id @default(cuid())\n  email         String    @unique\n  emailVerified Boolean   @default(false)\n  name          String\n  image         String?\n  role          Role      @default(CUSTOMER)\n  banned        Boolean?\n  banReason     String?\n  banExpires    DateTime?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n\n  // Relations\n  sessions        session[]\n  accounts        account[]\n  providerProfile providerProfile?\n  orders          order[]\n  reviews         review[]\n}\n\nmodel session {\n  id        String   @id @default(cuid())\n  userId    String\n  token     String   @unique\n  expiresAt DateTime\n  ipAddress String?\n  userAgent String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user user @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n}\n\nmodel account {\n  id                    String    @id @default(cuid())\n  userId                String\n  accountId             String\n  providerId            String\n  accessToken           String?\n  refreshToken          String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  idToken               String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  user user @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([providerId, accountId])\n  @@index([userId])\n}\n\nmodel verification {\n  id         String   @id @default(cuid())\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n}\n\n// ========================================\n// APPLICATION TABLES\n// ========================================\n\nmodel providerProfile {\n  id           String   @id @default(cuid())\n  userId       String   @unique\n  businessName String\n  description  String?\n  logo         String?\n  address      String?\n  phone        String?\n  cuisineType  String?\n  contactEmail String?\n  isActive     Boolean  @default(true)\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  // Relations\n  user   user    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  meals  meal[]\n  orders order[]\n\n  @@index([userId])\n}\n\nmodel category {\n  id          String   @id @default(cuid())\n  name        String   @unique\n  description String?\n  image       String?\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n\n  // Relations\n  meals meal[]\n}\n\nmodel meal {\n  id                String   @id @default(cuid())\n  providerProfileId String\n  categoryId        String\n  name              String\n  description       String?\n  price             Float\n  image             String?\n  isAvailable       Boolean  @default(true)\n  preparationTime   Int? // in minutes\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n\n  // Relations\n  providerProfile providerProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)\n  category        category        @relation(fields: [categoryId], references: [id])\n  orderItems      orderItem[]\n  reviews         review[]\n\n  @@index([providerProfileId])\n  @@index([categoryId])\n}\n\nmodel order {\n  id                String      @id @default(cuid())\n  customerId        String\n  providerProfileId String\n  status            OrderStatus @default(PLACED)\n  deliveryAddress   String\n  deliveryNotes     String?\n  totalAmount       Float\n  createdAt         DateTime    @default(now())\n  updatedAt         DateTime    @updatedAt\n\n  // Relations\n  customer        user            @relation(fields: [customerId], references: [id], onDelete: Cascade)\n  providerProfile providerProfile @relation(fields: [providerProfileId], references: [id], onDelete: Cascade)\n  orderItems      orderItem[]\n\n  @@index([customerId])\n  @@index([providerProfileId])\n  @@index([status])\n}\n\nmodel orderItem {\n  id        String   @id @default(cuid())\n  orderId   String\n  mealId    String\n  quantity  Int\n  unitPrice Float\n  createdAt DateTime @default(now())\n\n  // Relations\n  order order @relation(fields: [orderId], references: [id], onDelete: Cascade)\n  meal  meal  @relation(fields: [mealId], references: [id])\n\n  @@index([orderId])\n  @@index([mealId])\n}\n\nmodel review {\n  id        String   @id @default(cuid())\n  userId    String\n  mealId    String\n  rating    Int // 1-5\n  comment   String?\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  // Relations\n  user user @relation(fields: [userId], references: [id], onDelete: Cascade)\n  meal meal @relation(fields: [mealId], references: [id], onDelete: Cascade)\n\n  // One review per user per meal\n  @@unique([userId, mealId])\n  @@index([mealId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config2.runtimeDataModel = JSON.parse('{"models":{"user":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"name","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"banned","kind":"scalar","type":"Boolean"},{"name":"banReason","kind":"scalar","type":"String"},{"name":"banExpires","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"session","relationName":"sessionTouser"},{"name":"accounts","kind":"object","type":"account","relationName":"accountTouser"},{"name":"providerProfile","kind":"object","type":"providerProfile","relationName":"providerProfileTouser"},{"name":"orders","kind":"object","type":"order","relationName":"orderTouser"},{"name":"reviews","kind":"object","type":"review","relationName":"reviewTouser"}],"dbName":null},"session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"user","relationName":"sessionTouser"}],"dbName":null},"account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"user","relationName":"accountTouser"}],"dbName":null},"verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"providerProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"businessName","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"logo","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"cuisineType","kind":"scalar","type":"String"},{"name":"contactEmail","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"user","relationName":"providerProfileTouser"},{"name":"meals","kind":"object","type":"meal","relationName":"mealToproviderProfile"},{"name":"orders","kind":"object","type":"order","relationName":"orderToproviderProfile"}],"dbName":null},"category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"meals","kind":"object","type":"meal","relationName":"categoryTomeal"}],"dbName":null},"meal":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"providerProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"price","kind":"scalar","type":"Float"},{"name":"image","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"preparationTime","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"providerProfile","kind":"object","type":"providerProfile","relationName":"mealToproviderProfile"},{"name":"category","kind":"object","type":"category","relationName":"categoryTomeal"},{"name":"orderItems","kind":"object","type":"orderItem","relationName":"mealToorderItem"},{"name":"reviews","kind":"object","type":"review","relationName":"mealToreview"}],"dbName":null},"order":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"customerId","kind":"scalar","type":"String"},{"name":"providerProfileId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"OrderStatus"},{"name":"deliveryAddress","kind":"scalar","type":"String"},{"name":"deliveryNotes","kind":"scalar","type":"String"},{"name":"totalAmount","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"customer","kind":"object","type":"user","relationName":"orderTouser"},{"name":"providerProfile","kind":"object","type":"providerProfile","relationName":"orderToproviderProfile"},{"name":"orderItems","kind":"object","type":"orderItem","relationName":"orderToorderItem"}],"dbName":null},"orderItem":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"orderId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"quantity","kind":"scalar","type":"Int"},{"name":"unitPrice","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"order","kind":"object","type":"order","relationName":"orderToorderItem"},{"name":"meal","kind":"object","type":"meal","relationName":"mealToorderItem"}],"dbName":null},"review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"mealId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"user","relationName":"reviewTouser"},{"name":"meal","kind":"object","type":"meal","relationName":"mealToreview"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config2.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config2);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var Role = {
  CUSTOMER: "CUSTOMER",
  PROVIDER: "PROVIDER",
  ADMIN: "ADMIN"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
var pool = new Pool({
  connectionString: process.env["DATABASE_URL"]
});
var adapter = new PrismaPg(pool);
var prisma = new PrismaClient({ adapter });
var prisma_default = prisma;

// src/lib/auth.ts
var auth = betterAuth({
  // Base URL for auth endpoints
  baseURL: config.betterAuthUrl,
  // Secret for signing tokens/cookies
  secret: config.betterAuthSecret,
  // ======================
  // DATABASE ADAPTER
  // ======================
  database: prismaAdapter(prisma_default, {
    provider: "postgresql"
  }),
  // ======================
  // EMAIL & PASSWORD AUTH
  // ======================
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Simplified for assignment
    minPasswordLength: 6
  },
  // ======================
  // USER CONFIGURATION
  // ======================
  user: {
    // Additional fields to store on user
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: true
        // Allow setting during registration
      }
    }
  },
  // ======================
  // SESSION CONFIGURATION
  // ======================
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    // 7 days
    updateAge: 60 * 60 * 24,
    // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
      // 5 minutes
    }
  },
  // ======================
  // PLUGINS
  // ======================
  plugins: [
    // Admin plugin for user management
    admin({
      defaultRole: "CUSTOMER",
      adminRoles: ["ADMIN"]
    })
  ],
  // ======================
  // ADVANCED OPTIONS
  // ======================
  advanced: {
    // Use secure cookies in production
    useSecureCookies: config.nodeEnv === "production"
  },
  // ======================
  // TRUSTED ORIGINS
  // ======================
  trustedOrigins: [config.frontendUrl]
});

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  errors;
  constructor(message, statusCode = 500, isOperational = true, errors) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
};
var NotFoundError = class extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
};
var UnauthorizedError = class extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
};
var ForbiddenError = class extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
};
var BadRequestError = class extends AppError {
  constructor(message = "Bad request", errors) {
    super(message, 400, true, errors);
  }
};
var ValidationError = class extends AppError {
  constructor(errors) {
    super("Validation failed", 400, true, errors);
  }
};
var ConflictError = class extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
  }
};

// src/utils/response.util.ts
var sendSuccess = (res, data, message = "Success", statusCode = 200, meta) => {
  const response = {
    success: true,
    message,
    data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};
var sendError = (res, message = "An error occurred", statusCode = 500, errors) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};
var sendCreated = (res, data, message = "Created successfully") => sendSuccess(res, data, message, 201);
var sendNoContent = (res) => {
  return res.status(204).send();
};
var sendNotFound = (res, message = "Resource not found") => sendError(res, message, 404);

// src/middlewares/errorHandler.ts
var errorHandler = (err, _req, res, _next) => {
  if (config.nodeEnv === "development") {
    console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.error("\u{1F534} ERROR:", err.message);
    console.error("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501");
    console.error(err.stack);
  }
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err;
    if (prismaError.code === "P2002") {
      const field = prismaError.meta?.target?.[0] || "field";
      return sendError(res, `${field} already exists`, 409);
    }
    if (prismaError.code === "P2025") {
      return sendError(res, "Record not found", 404);
    }
  }
  if (err.name === "ZodError") {
    const zodError = err;
    const errors = {};
    zodError.errors.forEach((e) => {
      const field = e.path.join(".");
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(e.message);
    });
    return sendError(res, "Validation failed", 400, errors);
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return sendError(res, "Invalid or expired token", 401);
  }
  const message = config.nodeEnv === "development" ? err.message : "Internal server error";
  return sendError(res, message, 500);
};

// src/middlewares/requireAuth.ts
import { fromNodeHeaders } from "better-auth/node";
var requireAuth = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    if (!session || !session.user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (session.user.banned) {
      throw new UnauthorizedError(
        session.user.banReason || "Your account has been suspended"
      );
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(error);
  }
};

// src/middlewares/requireRole.ts
var requireRole = (...allowedRoles) => {
  return (req, _res, next) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }
      const userRole = req.user.role;
      if (!allowedRoles.includes(userRole)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var requireAdmin = requireRole(Role.ADMIN);
var requireProvider = requireRole(Role.PROVIDER, Role.ADMIN);
var requireCustomer = requireRole(Role.CUSTOMER, Role.ADMIN);

// src/middlewares/validate.ts
import { ZodError } from "zod";
var validate = (schema, options = { target: "body" }) => {
  return (req, res, next) => {
    try {
      const target = options.target || "body";
      const dataToValidate = req[target];
      const result = schema.safeParse(dataToValidate);
      if (!result.success) {
        const errors = {};
        result.error.issues.forEach((err) => {
          const field = err.path.join(".") || "value";
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });
        throw new ValidationError(errors);
      }
      if (target === "body") {
        req.body = result.data;
      } else {
        res.locals["validated" + target.charAt(0).toUpperCase() + target.slice(1)] = result.data;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = {};
        error.issues.forEach((err) => {
          const field = err.path.join(".") || "value";
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });
        next(new ValidationError(errors));
      } else {
        next(error);
      }
    }
  };
};
var validateBody = (schema) => validate(schema, { target: "body" });
var validateQuery = (schema) => validate(schema, { target: "query" });
var validateParams = (schema) => validate(schema, { target: "params" });

// src/routes/index.ts
import { Router as Router9 } from "express";

// src/routes/provider.routes.ts
import { Router } from "express";

// src/services/provider.service.ts
var getProfileByUserId = async (userId) => {
  const profile = await prisma_default.providerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true
        }
      }
    }
  });
  if (!profile) {
    throw new NotFoundError("Provider profile not found");
  }
  return profile;
};
var createProfile = async (userId, data) => {
  const existing = await prisma_default.providerProfile.findUnique({
    where: { userId }
  });
  if (existing) {
    throw new ConflictError("Provider profile already exists");
  }
  const profile = await prisma_default.providerProfile.create({
    data: {
      userId,
      businessName: data.businessName,
      description: data.description ?? null,
      logo: data.logo ?? null,
      address: data.address ?? null,
      phone: data.phone ?? null,
      cuisineType: data.cuisineType ?? null,
      contactEmail: data.contactEmail ?? null
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true
        }
      }
    }
  });
  return profile;
};
var updateProfile = async (userId, data) => {
  const existing = await prisma_default.providerProfile.findUnique({
    where: { userId }
  });
  if (!existing) {
    throw new NotFoundError("Provider profile not found");
  }
  const updateData = {};
  if (data.businessName !== void 0) updateData["businessName"] = data.businessName;
  if (data.description !== void 0) updateData["description"] = data.description;
  if (data.logo !== void 0) updateData["logo"] = data.logo;
  if (data.address !== void 0) updateData["address"] = data.address;
  if (data.phone !== void 0) updateData["phone"] = data.phone;
  if (data.cuisineType !== void 0) updateData["cuisineType"] = data.cuisineType;
  if (data.contactEmail !== void 0) updateData["contactEmail"] = data.contactEmail;
  if (data.isActive !== void 0) updateData["isActive"] = data.isActive;
  const profile = await prisma_default.providerProfile.update({
    where: { userId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true
        }
      }
    }
  });
  return profile;
};
var getProfileById = async (profileId) => {
  const profile = await prisma_default.providerProfile.findUnique({
    where: { id: profileId, isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      meals: {
        where: { isAvailable: true },
        include: {
          category: true,
          _count: {
            select: { reviews: true, orderItems: true }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: { meals: true, orders: true }
      }
    }
  });
  if (!profile) {
    throw new NotFoundError("Provider not found");
  }
  const mealIds = profile.meals.map((m) => m.id);
  const ratingStats = await prisma_default.review.aggregate({
    where: { mealId: { in: mealIds } },
    _avg: { rating: true },
    _count: true
  });
  return {
    ...profile,
    avgRating: ratingStats._avg.rating ?? 0,
    totalReviews: ratingStats._count
  };
};
var getAllProviders = async (query) => {
  const { search, cuisineType, page, limit } = query;
  const where = { isActive: true };
  if (cuisineType) {
    where["cuisineType"] = { contains: cuisineType, mode: "insensitive" };
  }
  if (search) {
    where["OR"] = [
      { businessName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { cuisineType: { contains: search, mode: "insensitive" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [providers, total] = await Promise.all([
    prisma_default.providerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: { meals: true, orders: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.providerProfile.count({ where })
  ]);
  const providerIds = providers.map((p) => p.id);
  const mealsByProvider = await prisma_default.meal.findMany({
    where: { providerProfileId: { in: providerIds } },
    select: { id: true, providerProfileId: true }
  });
  const mealIdsByProvider = {};
  mealsByProvider.forEach((m) => {
    if (!mealIdsByProvider[m.providerProfileId]) {
      mealIdsByProvider[m.providerProfileId] = [];
    }
    mealIdsByProvider[m.providerProfileId].push(m.id);
  });
  const allMealIds = mealsByProvider.map((m) => m.id);
  const ratings = await prisma_default.review.groupBy({
    by: ["mealId"],
    where: { mealId: { in: allMealIds } },
    _avg: { rating: true },
    _count: true
  });
  const mealToRating = {};
  ratings.forEach((r) => {
    mealToRating[r.mealId] = { avg: r._avg.rating ?? 0, count: r._count };
  });
  const enhancedProviders = providers.map((provider) => {
    const providerMealIds = mealIdsByProvider[provider.id] || [];
    let totalRating = 0;
    let totalReviews = 0;
    providerMealIds.forEach((mealId) => {
      const rating = mealToRating[mealId];
      if (rating) {
        totalRating += rating.avg * rating.count;
        totalReviews += rating.count;
      }
    });
    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;
    return {
      ...provider,
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews
    };
  });
  return {
    providers: enhancedProviders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// src/controllers/provider.controller.ts
var getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    sendSuccess(res, profile, "Profile fetched successfully");
  } catch (error) {
    next(error);
  }
};
var createProfile2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await createProfile(userId, req.body);
    sendCreated(res, profile, "Profile created successfully");
  } catch (error) {
    next(error);
  }
};
var updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await updateProfile(userId, req.body);
    sendSuccess(res, profile, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

// src/services/meal.service.ts
var createMeal = async (providerId, data) => {
  const category = await prisma_default.category.findUnique({
    where: { id: data.categoryId }
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  const meal = await prisma_default.meal.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      image: data.image ?? null,
      categoryId: data.categoryId,
      providerProfileId: providerId,
      isAvailable: data.isAvailable ?? true
    },
    include: {
      category: true,
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  return meal;
};
var getMeals = async (query) => {
  const { categoryId, providerId, search, minPrice, maxPrice, isAvailable, sort, page, limit } = query;
  const where = {};
  if (categoryId) where["categoryId"] = categoryId;
  if (providerId) where["providerProfileId"] = providerId;
  if (isAvailable !== void 0) where["isAvailable"] = isAvailable;
  if (search) {
    where["OR"] = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  if (minPrice !== void 0 || maxPrice !== void 0) {
    where["price"] = {};
    if (minPrice !== void 0) where["price"]["gte"] = minPrice;
    if (maxPrice !== void 0) where["price"]["lte"] = maxPrice;
  }
  let orderBy = { createdAt: "desc" };
  switch (sort) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }
  const skip = (page - 1) * limit;
  const [meals, total] = await Promise.all([
    prisma_default.meal.findMany({
      where,
      include: {
        category: true,
        providerProfile: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        _count: {
          select: { reviews: true, orderItems: true }
        }
      },
      orderBy,
      skip,
      take: limit
    }),
    prisma_default.meal.count({ where })
  ]);
  const mealIds = meals.map((m) => m.id);
  const ratings = await prisma_default.review.groupBy({
    by: ["mealId"],
    where: { mealId: { in: mealIds } },
    _avg: { rating: true },
    _count: true
  });
  const ratingMap = ratings.reduce(
    (acc, r) => {
      acc[r.mealId] = { avgRating: r._avg.rating ?? 0, reviewCount: r._count };
      return acc;
    },
    {}
  );
  const enhancedMeals = meals.map((meal) => ({
    ...meal,
    avgRating: ratingMap[meal.id]?.avgRating ?? 0,
    reviewCount: ratingMap[meal.id]?.reviewCount ?? 0
  }));
  let sortedMeals = enhancedMeals;
  if (sort === "rating") {
    sortedMeals = enhancedMeals.sort((a, b) => b.avgRating - a.avgRating);
  } else if (sort === "popular") {
    sortedMeals = enhancedMeals.sort((a, b) => b._count.orderItems - a._count.orderItems);
  }
  return {
    meals: sortedMeals,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getMealById = async (mealId) => {
  const meal = await prisma_default.meal.findUnique({
    where: { id: mealId },
    include: {
      category: true,
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 10
      },
      _count: {
        select: { reviews: true, orderItems: true }
      }
    }
  });
  if (!meal) {
    throw new NotFoundError("Meal not found");
  }
  const ratingStats = await prisma_default.review.aggregate({
    where: { mealId },
    _avg: { rating: true },
    _count: true
  });
  return {
    ...meal,
    avgRating: ratingStats._avg.rating ?? 0,
    totalReviews: ratingStats._count,
    totalOrders: meal._count.orderItems
  };
};
var updateMeal = async (mealId, providerId, data) => {
  const existingMeal = await prisma_default.meal.findUnique({
    where: { id: mealId }
  });
  if (!existingMeal) {
    throw new NotFoundError("Meal not found");
  }
  if (existingMeal.providerProfileId !== providerId) {
    throw new ForbiddenError("You can only update your own meals");
  }
  if (data.categoryId) {
    const category = await prisma_default.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      throw new NotFoundError("Category not found");
    }
  }
  const updateData = {};
  if (data.name !== void 0) updateData["name"] = data.name;
  if (data.description !== void 0) updateData["description"] = data.description;
  if (data.price !== void 0) updateData["price"] = data.price;
  if (data.image !== void 0) updateData["image"] = data.image;
  if (data.categoryId !== void 0) updateData["categoryId"] = data.categoryId;
  if (data.isAvailable !== void 0) updateData["isAvailable"] = data.isAvailable;
  const meal = await prisma_default.meal.update({
    where: { id: mealId },
    data: updateData,
    include: {
      category: true,
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  return meal;
};
var deleteMeal = async (mealId, providerId) => {
  const existingMeal = await prisma_default.meal.findUnique({
    where: { id: mealId }
  });
  if (!existingMeal) {
    throw new NotFoundError("Meal not found");
  }
  if (existingMeal.providerProfileId !== providerId) {
    throw new ForbiddenError("You can only delete your own meals");
  }
  await prisma_default.meal.delete({
    where: { id: mealId }
  });
  return { message: "Meal deleted successfully" };
};
var getProviderMeals = async (providerId) => {
  const meals = await prisma_default.meal.findMany({
    where: { providerProfileId: providerId },
    include: {
      category: true,
      _count: {
        select: { reviews: true, orderItems: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return meals;
};

// src/controllers/meal.controller.ts
var createMeal2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    const meal = await createMeal(profile.id, req.body);
    sendCreated(res, meal, "Meal created successfully");
  } catch (error) {
    next(error);
  }
};
var getMeals2 = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getMeals(query);
    sendSuccess(res, result.meals, "Meals fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getMealById2 = async (req, res, next) => {
  try {
    const id = req.params["id"];
    const meal = await getMealById(id);
    sendSuccess(res, meal, "Meal fetched successfully");
  } catch (error) {
    next(error);
  }
};
var updateMeal2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mealId = req.params["id"];
    const profile = await getProfileByUserId(userId);
    const meal = await updateMeal(mealId, profile.id, req.body);
    sendSuccess(res, meal, "Meal updated successfully");
  } catch (error) {
    next(error);
  }
};
var deleteMeal2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mealId = req.params["id"];
    const profile = await getProfileByUserId(userId);
    await deleteMeal(mealId, profile.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
var getMyMeals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    const meals = await getProviderMeals(profile.id);
    sendSuccess(res, meals, "Meals fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/services/order.service.ts
var VALID_STATUS_TRANSITIONS = {
  PLACED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED"],
  DELIVERED: [],
  // Terminal state
  CANCELLED: []
  // Terminal state
};
var getProviderOrders = async (providerId, query) => {
  const { status, page, limit } = query;
  const where = {
    providerProfile: { id: providerId }
  };
  if (status) {
    where["status"] = status;
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma_default.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        orderItems: {
          include: {
            meal: {
              select: { id: true, name: true, price: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.order.count({ where })
  ]);
  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getProviderOrderById = async (orderId, providerId) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      customerId: true,
      providerProfileId: true,
      status: true,
      totalAmount: true,
      deliveryAddress: true,
      deliveryNotes: true,
      createdAt: true,
      updatedAt: true,
      customer: {
        select: { id: true, name: true, email: true, image: true }
      },
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, price: true, image: true }
          }
        }
      }
    }
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.providerProfileId !== providerId) {
    throw new ForbiddenError("You can only view your own orders");
  }
  return order;
};
var updateOrderStatus = async (orderId, providerId, data) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: {
      providerProfile: {
        select: { id: true }
      }
    }
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.providerProfile.id !== providerId) {
    throw new ForbiddenError("You can only update your own orders");
  }
  const currentStatus = order.status;
  const newStatus = data.status;
  const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  if (!validTransitions.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(", ") || "none (terminal state)"}`
    );
  }
  const updatedOrder = await prisma_default.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      customer: {
        select: { id: true, name: true, email: true }
      },
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, price: true, image: true }
          }
        }
      }
    }
  });
  return updatedOrder;
};
var createOrder = async (userId, data) => {
  const mealIds = data.items.map((item) => item.mealId);
  const meals = await prisma_default.meal.findMany({
    where: {
      id: { in: mealIds },
      isAvailable: true
    },
    include: {
      providerProfile: true
    }
  });
  if (meals.length !== mealIds.length) {
    throw new BadRequestError("One or more meals are not available");
  }
  const providerIds = new Set(meals.map((m) => m.providerProfileId));
  if (providerIds.size > 1) {
    throw new BadRequestError("All items must be from the same provider");
  }
  const providerId = meals[0].providerProfileId;
  let totalAmount = 0;
  const orderItemsData = data.items.map((item) => {
    const meal = meals.find((m) => m.id === item.mealId);
    const itemTotal = Number(meal.price) * item.quantity;
    totalAmount += itemTotal;
    return {
      mealId: item.mealId,
      quantity: item.quantity,
      unitPrice: meal.price
    };
  });
  const order = await prisma_default.order.create({
    data: {
      customerId: userId,
      providerProfileId: providerId,
      totalAmount,
      deliveryAddress: data.deliveryAddress,
      deliveryNotes: data.deliveryNotes ?? null,
      status: "PLACED",
      orderItems: {
        create: orderItemsData
      }
    },
    include: {
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, price: true, image: true }
          }
        }
      },
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  return order;
};
var getCustomerOrders = async (userId, query) => {
  const { status, page, limit } = query;
  const where = {
    customerId: userId
  };
  if (status) {
    where["status"] = status;
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma_default.order.findMany({
      where,
      include: {
        providerProfile: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        orderItems: {
          include: {
            meal: {
              select: { id: true, name: true, price: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.order.count({ where })
  ]);
  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getCustomerOrderById = async (orderId, userId) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: {
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, price: true, image: true }
          }
        }
      }
    }
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.customerId !== userId) {
    throw new ForbiddenError("You can only view your own orders");
  }
  return order;
};

// src/controllers/order.controller.ts
var getProviderOrders2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfileByUserId(userId);
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getProviderOrders(profile.id, query);
    sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getProviderOrderById2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params["id"];
    const profile = await getProfileByUserId(userId);
    const order = await getProviderOrderById(orderId, profile.id);
    sendSuccess(res, order, "Order fetched successfully");
  } catch (error) {
    next(error);
  }
};
var updateOrderStatus2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params["id"];
    const profile = await getProfileByUserId(userId);
    const order = await updateOrderStatus(orderId, profile.id, req.body);
    sendSuccess(res, order, "Order status updated successfully");
  } catch (error) {
    next(error);
  }
};
var createOrder2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const order = await createOrder(userId, req.body);
    sendCreated(res, order, "Order placed successfully");
  } catch (error) {
    next(error);
  }
};
var getCustomerOrders2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getCustomerOrders(userId, query);
    sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getCustomerOrderById2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params["id"];
    const order = await getCustomerOrderById(orderId, userId);
    sendSuccess(res, order, "Order fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/validations/provider.validation.ts
import { z } from "zod";
var createProviderProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be at most 100 characters"),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  logo: z.string().url("Logo must be a valid URL").optional(),
  address: z.string().max(255, "Address must be at most 255 characters").optional(),
  phone: z.string().regex(/^[\d\s\-+()]+$/, "Invalid phone number format").optional(),
  cuisineType: z.string().max(50, "Cuisine type must be at most 50 characters").optional(),
  contactEmail: z.string().email("Invalid email format").optional()
});
var updateProviderProfileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(100, "Business name must be at most 100 characters").optional(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  logo: z.string().url("Logo must be a valid URL").optional(),
  address: z.string().max(255, "Address must be at most 255 characters").optional(),
  phone: z.string().regex(/^[\d\s\-+()]+$/, "Invalid phone number format").optional(),
  cuisineType: z.string().max(50, "Cuisine type must be at most 50 characters").optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
  isActive: z.boolean().optional()
});

// src/validations/meal.validation.ts
import { z as z2 } from "zod";
var SortOptions = ["price_asc", "price_desc", "newest", "oldest", "rating", "popular"];
var createMealSchema = z2.object({
  name: z2.string().min(2, "Meal name must be at least 2 characters").max(100, "Meal name must be at most 100 characters"),
  description: z2.string().max(1e3, "Description must be at most 1000 characters").optional(),
  price: z2.number().positive("Price must be a positive number").max(99999.99, "Price is too high"),
  image: z2.string().url("Image must be a valid URL").optional(),
  categoryId: z2.string().cuid("Invalid category ID"),
  isAvailable: z2.boolean().optional().default(true)
});
var updateMealSchema = z2.object({
  name: z2.string().min(2, "Meal name must be at least 2 characters").max(100, "Meal name must be at most 100 characters").optional(),
  description: z2.string().max(1e3, "Description must be at most 1000 characters").optional(),
  price: z2.number().positive("Price must be a positive number").max(99999.99, "Price is too high").optional(),
  image: z2.string().url("Image must be a valid URL").optional(),
  categoryId: z2.string().cuid("Invalid category ID").optional(),
  isAvailable: z2.boolean().optional()
});
var mealQuerySchema = z2.object({
  categoryId: z2.string().cuid().optional(),
  providerId: z2.string().cuid().optional(),
  search: z2.string().optional(),
  minPrice: z2.coerce.number().positive().optional(),
  maxPrice: z2.coerce.number().positive().optional(),
  isAvailable: z2.coerce.boolean().optional(),
  sort: z2.enum(SortOptions).optional().default("newest"),
  page: z2.coerce.number().int().positive().default(1),
  limit: z2.coerce.number().int().positive().max(100).default(10)
});
var mealIdParamSchema = z2.object({
  id: z2.string().cuid("Invalid meal ID")
});

// src/validations/order.validation.ts
import { z as z3 } from "zod";
var OrderStatusValues = ["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"];
var orderItemSchema = z3.object({
  mealId: z3.string().cuid("Invalid meal ID"),
  quantity: z3.number().int().positive("Quantity must be a positive integer").max(100)
});
var createOrderSchema = z3.object({
  items: z3.array(orderItemSchema).min(1, "Order must contain at least one item").max(50, "Order cannot contain more than 50 items"),
  deliveryAddress: z3.string().max(500, "Delivery address is too long"),
  deliveryNotes: z3.string().max(500, "Notes are too long").optional()
});
var updateOrderStatusSchema = z3.object({
  status: z3.enum(OrderStatusValues, {
    message: "Invalid order status. Must be one of: PLACED, PREPARING, READY, DELIVERED, CANCELLED"
  })
});
var orderQuerySchema = z3.object({
  status: z3.enum(OrderStatusValues).optional(),
  page: z3.coerce.number().int().positive().default(1),
  limit: z3.coerce.number().int().positive().max(100).default(10)
});
var orderIdParamSchema = z3.object({
  id: z3.string().cuid("Invalid order ID")
});

// src/routes/provider.routes.ts
var router = Router();
router.get(
  "/profile",
  requireAuth,
  requireProvider,
  getMyProfile
);
router.post(
  "/profile",
  requireAuth,
  requireProvider,
  validateBody(createProviderProfileSchema),
  createProfile2
);
router.put(
  "/profile",
  requireAuth,
  requireProvider,
  validateBody(updateProviderProfileSchema),
  updateMyProfile
);
router.get(
  "/meals",
  requireAuth,
  requireProvider,
  getMyMeals
);
router.post(
  "/meals",
  requireAuth,
  requireProvider,
  validateBody(createMealSchema),
  createMeal2
);
router.put(
  "/meals/:id",
  requireAuth,
  requireProvider,
  validateParams(mealIdParamSchema),
  validateBody(updateMealSchema),
  updateMeal2
);
router.delete(
  "/meals/:id",
  requireAuth,
  requireProvider,
  validateParams(mealIdParamSchema),
  deleteMeal2
);
router.get(
  "/orders",
  requireAuth,
  requireProvider,
  validateQuery(orderQuerySchema),
  getProviderOrders2
);
router.get(
  "/orders/:id",
  requireAuth,
  requireProvider,
  validateParams(orderIdParamSchema),
  getProviderOrderById2
);
router.patch(
  "/orders/:id/status",
  requireAuth,
  requireProvider,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus2
);
var provider_routes_default = router;

// src/routes/meal.routes.ts
import { Router as Router2 } from "express";

// src/services/review.service.ts
var createReview = async (userId, data) => {
  const meal = await prisma_default.meal.findUnique({
    where: { id: data.mealId }
  });
  if (!meal) {
    throw new NotFoundError("Meal not found");
  }
  const existingReview = await prisma_default.review.findUnique({
    where: {
      userId_mealId: {
        userId,
        mealId: data.mealId
      }
    }
  });
  if (existingReview) {
    throw new ConflictError("You have already reviewed this meal");
  }
  const review = await prisma_default.review.create({
    data: {
      userId,
      mealId: data.mealId,
      rating: data.rating,
      comment: data.comment ?? null
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      meal: {
        select: { id: true, name: true }
      }
    }
  });
  return review;
};
var getMealReviews = async (mealId, query) => {
  const { page, limit } = query;
  const meal = await prisma_default.meal.findUnique({
    where: { id: mealId }
  });
  if (!meal) {
    throw new NotFoundError("Meal not found");
  }
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma_default.review.findMany({
      where: { mealId },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.review.count({ where: { mealId } })
  ]);
  const avgResult = await prisma_default.review.aggregate({
    where: { mealId },
    _avg: { rating: true }
  });
  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      averageRating: avgResult._avg.rating ?? 0
    }
  };
};
var updateReview = async (reviewId, userId, data) => {
  const review = await prisma_default.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  if (review.userId !== userId) {
    throw new ForbiddenError("You can only update your own reviews");
  }
  const updateData = {};
  if (data.rating !== void 0) updateData["rating"] = data.rating;
  if (data.comment !== void 0) updateData["comment"] = data.comment;
  const updatedReview = await prisma_default.review.update({
    where: { id: reviewId },
    data: updateData,
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      meal: {
        select: { id: true, name: true }
      }
    }
  });
  return updatedReview;
};
var deleteReview = async (reviewId, userId) => {
  const review = await prisma_default.review.findUnique({
    where: { id: reviewId }
  });
  if (!review) {
    throw new NotFoundError("Review not found");
  }
  if (review.userId !== userId) {
    throw new ForbiddenError("You can only delete your own reviews");
  }
  await prisma_default.review.delete({
    where: { id: reviewId }
  });
  return { message: "Review deleted successfully" };
};
var getMyReviews = async (userId, query) => {
  const { page, limit } = query;
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    prisma_default.review.findMany({
      where: { userId },
      include: {
        meal: {
          select: { id: true, name: true, image: true, price: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.review.count({ where: { userId } })
  ]);
  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// src/controllers/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const review = await createReview(userId, req.body);
    sendCreated(res, review, "Review created successfully");
  } catch (error) {
    next(error);
  }
};
var getMealReviews2 = async (req, res, next) => {
  try {
    const mealId = req.params["mealId"];
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getMealReviews(mealId, query);
    sendSuccess(res, result.reviews, "Reviews fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var updateReview2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params["id"];
    const review = await updateReview(reviewId, userId, req.body);
    sendSuccess(res, review, "Review updated successfully");
  } catch (error) {
    next(error);
  }
};
var deleteReview2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params["id"];
    await deleteReview(reviewId, userId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};
var getMyReviews2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getMyReviews(userId, query);
    sendSuccess(res, result.reviews, "Reviews fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};

// src/validations/review.validation.ts
import { z as z4 } from "zod";
var createReviewSchema = z4.object({
  mealId: z4.string().cuid("Invalid meal ID"),
  rating: z4.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z4.string().max(1e3, "Comment is too long").optional()
});
var updateReviewSchema = z4.object({
  rating: z4.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5").optional(),
  comment: z4.string().max(1e3, "Comment is too long").optional()
});
var mealIdParamSchema2 = z4.object({
  mealId: z4.string().cuid("Invalid meal ID")
});
var reviewIdParamSchema = z4.object({
  id: z4.string().cuid("Invalid review ID")
});
var reviewQuerySchema = z4.object({
  page: z4.coerce.number().int().positive().default(1),
  limit: z4.coerce.number().int().positive().max(50).default(10)
});

// src/routes/meal.routes.ts
var router2 = Router2();
router2.get(
  "/",
  validateQuery(mealQuerySchema),
  getMeals2
);
router2.get(
  "/:id",
  validateParams(mealIdParamSchema),
  getMealById2
);
router2.get(
  "/:mealId/reviews",
  validateParams(mealIdParamSchema2),
  validateQuery(reviewQuerySchema),
  getMealReviews2
);
var meal_routes_default = router2;

// src/routes/order.routes.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.post(
  "/",
  requireAuth,
  validateBody(createOrderSchema),
  createOrder2
);
router3.get(
  "/",
  requireAuth,
  validateQuery(orderQuerySchema),
  getCustomerOrders2
);
router3.get(
  "/:id",
  requireAuth,
  validateParams(orderIdParamSchema),
  getCustomerOrderById2
);
var order_routes_default = router3;

// src/routes/review.routes.ts
import { Router as Router4 } from "express";
var router4 = Router4();
router4.post(
  "/",
  requireAuth,
  validateBody(createReviewSchema),
  createReview2
);
router4.get(
  "/me",
  requireAuth,
  validateQuery(reviewQuerySchema),
  getMyReviews2
);
router4.put(
  "/:id",
  requireAuth,
  validateParams(reviewIdParamSchema),
  validateBody(updateReviewSchema),
  updateReview2
);
router4.delete(
  "/:id",
  requireAuth,
  validateParams(reviewIdParamSchema),
  deleteReview2
);
var review_routes_default = router4;

// src/routes/admin.routes.ts
import { Router as Router5 } from "express";

// src/services/admin.service.ts
var getUsers = async (query) => {
  const { role, search, isBanned, page, limit } = query;
  const where = {};
  if (role) {
    where["role"] = role;
  }
  if (isBanned !== void 0) {
    where["banned"] = isBanned;
  }
  if (search) {
    where["OR"] = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma_default.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.user.count({ where })
  ]);
  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getUserById = async (userId) => {
  const user = await prisma_default.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      banned: true,
      banReason: true,
      createdAt: true,
      updatedAt: true,
      providerProfile: {
        select: {
          id: true,
          businessName: true,
          createdAt: true
        }
      },
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};
var banUser = async (adminId, userId, data) => {
  if (adminId === userId) {
    throw new BadRequestError("You cannot ban yourself");
  }
  const user = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (user.role === "ADMIN") {
    throw new ForbiddenError("Cannot ban other administrators");
  }
  if (data.banned && user.banned) {
    throw new BadRequestError("User is already banned");
  }
  if (!data.banned && !user.banned) {
    throw new BadRequestError("User is not banned");
  }
  const updatedUser = await prisma_default.user.update({
    where: { id: userId },
    data: {
      banned: data.banned,
      banReason: data.banned ? data.banReason ?? null : null
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
      updatedAt: true
    }
  });
  return updatedUser;
};
var getAllOrders = async (query) => {
  const { status, providerId, customerId, page, limit } = query;
  const where = {};
  if (status) {
    where["status"] = status;
  }
  if (providerId) {
    where["providerProfileId"] = providerId;
  }
  if (customerId) {
    where["customerId"] = customerId;
  }
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma_default.order.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        providerProfile: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          }
        },
        orderItems: {
          include: {
            meal: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.order.count({ where })
  ]);
  return {
    orders,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getDashboardStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalOrders,
    totalMeals,
    recentOrders,
    orderStats
  ] = await Promise.all([
    prisma_default.user.count(),
    prisma_default.providerProfile.count(),
    prisma_default.order.count(),
    prisma_default.meal.count(),
    prisma_default.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { name: true }
        }
      }
    }),
    prisma_default.order.groupBy({
      by: ["status"],
      _count: true
    })
  ]);
  const ordersByStatus = orderStats.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    },
    {}
  );
  return {
    totalUsers,
    totalProviders,
    totalOrders,
    totalMeals,
    ordersByStatus,
    recentOrders
  };
};

// src/controllers/admin.controller.ts
var getUsers2 = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getUsers(query);
    sendSuccess(res, result.users, "Users fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getUserById2 = async (req, res, next) => {
  try {
    const userId = req.params["id"];
    const user = await getUserById(userId);
    sendSuccess(res, user, "User fetched successfully");
  } catch (error) {
    next(error);
  }
};
var banUser2 = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params["id"];
    const user = await banUser(adminId, userId, req.body);
    const message = req.body.banned ? "User banned successfully" : "User unbanned successfully";
    sendSuccess(res, user, message);
  } catch (error) {
    next(error);
  }
};
var getAllOrders2 = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getAllOrders(query);
    sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getDashboardStats2 = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    sendSuccess(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/services/category.service.ts
var getCategories = async (query) => {
  const { search, page, limit } = query;
  const where = {};
  if (search) {
    where["OR"] = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [categories, total] = await Promise.all([
    prisma_default.category.findMany({
      where,
      include: {
        _count: {
          select: { meals: true }
        }
      },
      orderBy: { name: "asc" },
      skip,
      take: limit
    }),
    prisma_default.category.count({ where })
  ]);
  return {
    categories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getCategoryById = async (categoryId) => {
  const category = await prisma_default.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { meals: true }
      }
    }
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
};
var createCategory = async (data) => {
  const existingCategory = await prisma_default.category.findUnique({
    where: { name: data.name }
  });
  if (existingCategory) {
    throw new ConflictError("A category with this name already exists");
  }
  const category = await prisma_default.category.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      image: data.image ?? null
    }
  });
  return category;
};
var updateCategory = async (categoryId, data) => {
  const category = await prisma_default.category.findUnique({
    where: { id: categoryId }
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  if (data.name && data.name !== category.name) {
    const existingCategory = await prisma_default.category.findUnique({
      where: { name: data.name }
    });
    if (existingCategory) {
      throw new ConflictError("A category with this name already exists");
    }
  }
  const updateData = {};
  if (data.name !== void 0) updateData["name"] = data.name;
  if (data.description !== void 0) updateData["description"] = data.description;
  if (data.image !== void 0) updateData["image"] = data.image;
  const updatedCategory = await prisma_default.category.update({
    where: { id: categoryId },
    data: updateData
  });
  return updatedCategory;
};
var deleteCategory = async (categoryId) => {
  const category = await prisma_default.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { meals: true }
      }
    }
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  if (category._count.meals > 0) {
    throw new BadRequestError(
      `Cannot delete category with ${category._count.meals} meal(s). Please reassign or delete the meals first.`
    );
  }
  await prisma_default.category.delete({
    where: { id: categoryId }
  });
  return { message: "Category deleted successfully" };
};

// src/controllers/category.controller.ts
var getCategories2 = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getCategories(query);
    sendSuccess(res, result.categories, "Categories fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getCategoryById2 = async (req, res, next) => {
  try {
    const categoryId = req.params["id"];
    const category = await getCategoryById(categoryId);
    sendSuccess(res, category, "Category fetched successfully");
  } catch (error) {
    next(error);
  }
};
var createCategory2 = async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    sendCreated(res, category, "Category created successfully");
  } catch (error) {
    next(error);
  }
};
var updateCategory2 = async (req, res, next) => {
  try {
    const categoryId = req.params["id"];
    const category = await updateCategory(categoryId, req.body);
    sendSuccess(res, category, "Category updated successfully");
  } catch (error) {
    next(error);
  }
};
var deleteCategory2 = async (req, res, next) => {
  try {
    const categoryId = req.params["id"];
    await deleteCategory(categoryId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

// src/validations/admin.validation.ts
import { z as z5 } from "zod";
var RoleValues = ["CUSTOMER", "PROVIDER", "ADMIN"];
var userListQuerySchema = z5.object({
  role: z5.enum(RoleValues).optional(),
  search: z5.string().optional(),
  isBanned: z5.coerce.boolean().optional(),
  page: z5.coerce.number().int().positive().default(1),
  limit: z5.coerce.number().int().positive().max(100).default(10)
});
var banUserSchema = z5.object({
  banned: z5.boolean(),
  banReason: z5.string().max(500, "Ban reason is too long").optional()
});
var userIdParamSchema = z5.object({
  id: z5.string().cuid("Invalid user ID")
});
var providerIdParamSchema = z5.object({
  id: z5.string().cuid("Invalid provider ID")
});
var adminOrderQuerySchema = z5.object({
  status: z5.enum(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
  providerId: z5.string().cuid().optional(),
  customerId: z5.string().cuid().optional(),
  page: z5.coerce.number().int().positive().default(1),
  limit: z5.coerce.number().int().positive().max(100).default(10)
});

// src/validations/category.validation.ts
import { z as z6 } from "zod";
var createCategorySchema = z6.object({
  name: z6.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters"),
  description: z6.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z6.string().url("Image must be a valid URL").optional()
});
var updateCategorySchema = z6.object({
  name: z6.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters").optional(),
  description: z6.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z6.string().url("Image must be a valid URL").nullable().optional()
});
var categoryIdParamSchema = z6.object({
  id: z6.string().cuid("Invalid category ID")
});
var categoryQuerySchema = z6.object({
  search: z6.string().optional(),
  page: z6.coerce.number().int().positive().default(1),
  limit: z6.coerce.number().int().positive().max(100).default(20)
});

// src/routes/admin.routes.ts
var router5 = Router5();
router5.use(requireAuth, requireAdmin);
router5.get("/dashboard", getDashboardStats2);
router5.get(
  "/users",
  validateQuery(userListQuerySchema),
  getUsers2
);
router5.get(
  "/users/:id",
  validateParams(userIdParamSchema),
  getUserById2
);
router5.patch(
  "/users/:id/ban",
  validateParams(userIdParamSchema),
  validateBody(banUserSchema),
  banUser2
);
router5.get(
  "/orders",
  validateQuery(adminOrderQuerySchema),
  getAllOrders2
);
router5.post(
  "/categories",
  validateBody(createCategorySchema),
  createCategory2
);
router5.put(
  "/categories/:id",
  validateParams(categoryIdParamSchema),
  validateBody(updateCategorySchema),
  updateCategory2
);
router5.delete(
  "/categories/:id",
  validateParams(categoryIdParamSchema),
  deleteCategory2
);
var admin_routes_default = router5;

// src/routes/category.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get(
  "/",
  validateQuery(categoryQuerySchema),
  getCategories2
);
router6.get(
  "/:id",
  validateParams(categoryIdParamSchema),
  getCategoryById2
);
var category_routes_default = router6;

// src/routes/public-provider.routes.ts
import { Router as Router7 } from "express";

// src/controllers/public-provider.controller.ts
var getProviders = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getAllProviders(query);
    sendSuccess(res, result.providers, "Providers fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var getProviderById = async (req, res, next) => {
  try {
    const providerId = req.params["id"];
    const provider = await getProfileById(providerId);
    sendSuccess(res, provider, "Provider fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/validations/public-provider.validation.ts
import { z as z7 } from "zod";
var providerQuerySchema = z7.object({
  search: z7.string().optional(),
  cuisineType: z7.string().optional(),
  page: z7.coerce.number().int().positive().default(1),
  limit: z7.coerce.number().int().positive().max(100).default(10)
});
var providerIdParamSchema2 = z7.object({
  id: z7.string().cuid("Invalid provider ID")
});

// src/routes/public-provider.routes.ts
var router7 = Router7();
router7.get(
  "/",
  validateQuery(providerQuerySchema),
  getProviders
);
router7.get(
  "/:id",
  validateParams(providerIdParamSchema2),
  getProviderById
);
var public_provider_routes_default = router7;

// src/routes/user.routes.ts
import { Router as Router8 } from "express";

// src/services/user.service.ts
var getProfile = async (userId) => {
  const user = await prisma_default.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return user;
};
var updateProfile2 = async (userId, data) => {
  const user = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const updateData = {};
  if (data.name !== void 0) updateData["name"] = data.name;
  if (data.image !== void 0) updateData["image"] = data.image;
  const updatedUser = await prisma_default.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true
    }
  });
  return updatedUser;
};
var getOrderHistory = async (userId) => {
  const orders = await prisma_default.order.findMany({
    where: { customerId: userId },
    include: {
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      providerProfile: {
        select: { id: true, businessName: true, logo: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const ordersByStatus = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {}
  );
  return {
    orders,
    summary: {
      totalOrders: orders.length,
      totalSpent,
      ordersByStatus
    }
  };
};
var getDashboardStats3 = async (userId) => {
  const [orderStats, reviewCount, recentOrders] = await Promise.all([
    prisma_default.order.aggregate({
      where: { customerId: userId },
      _count: true,
      _sum: { totalAmount: true }
    }),
    prisma_default.review.count({ where: { userId } }),
    prisma_default.order.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        providerProfile: {
          select: { businessName: true }
        }
      }
    })
  ]);
  return {
    totalOrders: orderStats._count,
    totalSpent: Number(orderStats._sum.totalAmount) || 0,
    totalReviews: reviewCount,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      providerName: order.providerProfile.businessName,
      createdAt: order.createdAt
    }))
  };
};

// src/controllers/user.controller.ts
var getProfile2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await getProfile(userId);
    sendSuccess(res, profile, "Profile fetched successfully");
  } catch (error) {
    next(error);
  }
};
var updateProfile3 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await updateProfile2(userId, req.body);
    sendSuccess(res, profile, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};
var getOrderHistory2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getOrderHistory(userId);
    sendSuccess(res, result, "Order history fetched successfully");
  } catch (error) {
    next(error);
  }
};
var getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const stats = await getDashboardStats3(userId);
    sendSuccess(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/validations/user.validation.ts
import { z as z8 } from "zod";
var updateProfileSchema = z8.object({
  name: z8.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
  image: z8.string().url("Image must be a valid URL").nullable().optional()
});

// src/routes/user.routes.ts
var router8 = Router8();
router8.use(requireAuth);
router8.get("/profile", getProfile2);
router8.patch(
  "/profile",
  validateBody(updateProfileSchema),
  updateProfile3
);
router8.get("/dashboard", getDashboard);
router8.get("/orders", getOrderHistory2);
var user_routes_default = router8;

// src/routes/index.ts
var router9 = Router9();
router9.use("/user", user_routes_default);
router9.use("/provider", provider_routes_default);
router9.use("/meals", meal_routes_default);
router9.use("/orders", order_routes_default);
router9.use("/reviews", review_routes_default);
router9.use("/admin", admin_routes_default);
router9.use("/categories", category_routes_default);
router9.use("/providers", public_provider_routes_default);
var routes_default = router9;

// src/app.ts
var app = express();
app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
    // Allow cookies for BetterAuth sessions
  })
);
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub API is running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: config.nodeEnv
  });
});
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", routes_default);
app.use((_req, res) => {
  sendNotFound(res, "Route not found");
});
app.use(errorHandler);
var app_default = app;

// src/server.ts
async function startServer() {
  try {
    await prisma_default.$queryRaw`SELECT 1`;
    console.log("\u2705 Database connected successfully");
    app_default.listen(config.port, () => {
      console.log(`
\u{1F371} FoodHub API Server
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F680} Server:      http://localhost:${config.port}
\u{1F3E5} Health:      http://localhost:${config.port}/health
\u{1F30D} Environment: ${config.nodeEnv}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
      `);
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
}
process.on("SIGINT", async () => {
  console.log("\n\u{1F6D1} Shutting down gracefully...");
  await prisma_default.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("\n\u{1F6D1} Shutting down gracefully...");
  await prisma_default.$disconnect();
  process.exit(0);
});
if (process.env["VERCEL"] !== "1") {
  startServer();
}
var server_default = app_default;
export {
  server_default as default
};
