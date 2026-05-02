// src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/controllers/auth.controller.ts
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
var databaseUrl = process.env["DATABASE_URL"]?.replace("&channel_binding=require", "") || process.env["DATABASE_URL"];
if (!databaseUrl && process.env["NODE_ENV"] === "production") {
  console.warn("\u26A0\uFE0F DATABASE_URL is missing in production environment!");
}
if (databaseUrl) {
  process.env["DATABASE_URL"] = databaseUrl;
}
var prisma;
try {
  if (databaseUrl) {
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 5e3,
      ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    prisma = new PrismaClient();
  }
} catch (error) {
  console.error("\u274C Prisma initialization error:", error);
  prisma = new PrismaClient();
}
var prisma_default = prisma;

// src/lib/jwt.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
var signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  });
};
var verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn("JWT Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn("JWT Token invalid");
    }
    return null;
  }
};

// src/config/index.ts
import "dotenv/config";
var config = {
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
  sslcommerzStoreId: process.env["SSL_STORE_ID"] ?? process.env["STORE_ID"] ?? "",
  sslcommerzStorePassword: process.env["SSL_STORE_PASS"] ?? process.env["STORE_PASSWORD"] ?? "",
  sslcommerzIsLive: process.env["IS_SANDBOX"] === "true" ? false : process.env["IS_LIVE"] === "true"
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
var sendUnauthorized = (res, message = "Unauthorized") => sendError(res, message, 401);
var sendForbidden = (res, message = "Forbidden") => sendError(res, message, 403);
var sendBadRequest = (res, message = "Bad request", errors) => sendError(res, message, 400, errors);
var setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
    // 7 days
  });
};
var clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
};

// src/controllers/auth.controller.ts
var googleClient = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret
);
var register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return sendBadRequest(res, "Missing required fields");
    }
    const existingUser = await prisma_default.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return sendBadRequest(res, "User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma_default.user.create({
      data: {
        email,
        name,
        role: role || "CUSTOMER",
        accounts: {
          create: {
            providerId: "credential",
            accountId: email,
            password: hashedPassword
          }
        }
      }
    });
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = signToken(payload);
    setAuthCookie(res, token);
    return sendCreated(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, "Registration successful");
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, "Internal server error");
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendBadRequest(res, "Missing email or password");
    }
    const user = await prisma_default.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { providerId: "credential" }
        }
      }
    });
    if (!user || !user.accounts[0]?.password) {
      return sendUnauthorized(res, "Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.accounts[0].password);
    if (!isPasswordValid) {
      return sendUnauthorized(res, "Invalid credentials");
    }
    if (user.banned) {
      return sendForbidden(res, `Account is banned: ${user.banReason || "No reason provided"}`);
    }
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = signToken(payload);
    setAuthCookie(res, token);
    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    }, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Internal server error");
  }
};
var googleAuthRedirect = (req, res) => {
  const callbackURL = req.query.callbackURL || config.frontendUrl;
  const state = Buffer.from(JSON.stringify({ callbackURL })).toString("base64");
  const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/callback/google`;
  const authUrl = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
    state,
    redirect_uri: redirectUri
  });
  return res.redirect(authUrl);
};
var googleAuthCallback = async (req, res) => {
  const code = req.query.code;
  const stateStr = req.query.state;
  let callbackURL = config.frontendUrl;
  try {
    if (stateStr) {
      const decodedState = JSON.parse(Buffer.from(stateStr, "base64").toString("utf-8"));
      if (decodedState.callbackURL) {
        callbackURL = decodedState.callbackURL;
      }
    }
  } catch (e) {
    console.error("Failed to parse state", e);
  }
  const allowedDomains = ["localhost:3000", "foodhub-frontend-sand.vercel.app"];
  try {
    const urlObj = new URL(callbackURL);
    if (!allowedDomains.some((d) => urlObj.host.includes(d))) {
      callbackURL = config.frontendUrl;
    }
  } catch (e) {
    callbackURL = config.frontendUrl;
  }
  try {
    const redirectUri = `${req.protocol}://${req.get("host")}/api/auth/callback/google`;
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri
    });
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: config.googleClientId
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${callbackURL}?error=InvalidGoogleToken`);
    }
    let user = await prisma_default.user.findUnique({
      where: { email: payload.email }
    });
    if (!user) {
      user = await prisma_default.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email,
          image: payload.picture || null,
          role: "CUSTOMER",
          accounts: {
            create: {
              providerId: "google",
              accountId: payload.sub
            }
          }
        }
      });
    } else {
      const existingAccount = await prisma_default.account.findFirst({
        where: {
          userId: user.id,
          providerId: "google"
        }
      });
      if (!existingAccount) {
        await prisma_default.account.create({
          data: {
            userId: user.id,
            providerId: "google",
            accountId: payload.sub
          }
        });
      }
    }
    if (user.banned) {
      return res.redirect(`${callbackURL}?error=AccountBanned`);
    }
    const jwtPayload = { id: user.id, email: user.email, role: user.role };
    const token = signToken(jwtPayload);
    setAuthCookie(res, token);
    const redirectUrlWithToken = new URL(callbackURL);
    redirectUrlWithToken.searchParams.set("token", token);
    return res.redirect(redirectUrlWithToken.toString());
  } catch (error) {
    console.error("Google auth callback error:", error);
    return res.redirect(`${callbackURL}?error=AuthFailed`);
  }
};
var logout = (req, res) => {
  clearAuthCookie(res);
  return sendSuccess(res, null, "Logged out successfully");
};
var getMe = async (req, res) => {
  if (!req.user) {
    return sendUnauthorized(res, "Not authenticated");
  }
  return sendSuccess(res, { user: req.user }, "User profile fetched successfully");
};

// src/middlewares/auth.middleware.ts
var authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.token;
    let token = cookieToken;
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const user = await prisma_default.user.findUnique({
      where: { id: decoded.id },
      include: {
        providerProfile: true
      }
    });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.banned) {
      return res.status(403).json({ message: `Account banned: ${user.banReason || "No reason provided"}` });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

// src/routes/auth.routes.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/google", googleAuthRedirect);
router.get("/callback/google", googleAuthCallback);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
var auth_routes_default = router;

// src/routes/payment.routes.ts
import { Router as Router2 } from "express";

// src/lib/sslcommerz.ts
import SSLCommerzPayment from "sslcommerz-lts";
var sslcommerz = new SSLCommerzPayment(
  config.sslcommerzStoreId,
  config.sslcommerzStorePassword,
  config.sslcommerzIsLive
);

// src/controllers/payment.controller.ts
var initPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;
    const order = await prisma_default.order.findUnique({
      where: { id: orderId },
      include: { customer: true }
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.customerId !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (order.paymentStatus !== "PENDING") {
      return res.status(400).json({ success: false, message: "Order is not pending payment" });
    }
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    await prisma_default.order.update({
      where: { id: orderId },
      data: { transactionId }
    });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = {
      total_amount: order.totalAmount,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${baseUrl}/api/payment/success/${transactionId}`,
      fail_url: `${baseUrl}/api/payment/fail/${transactionId}`,
      cancel_url: `${baseUrl}/api/payment/cancel/${transactionId}`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Food Order",
      product_category: "Food",
      product_profile: "general",
      cus_name: order.customer.name || "Customer",
      cus_email: order.customer.email,
      cus_add1: order.deliveryAddress,
      cus_add2: order.deliveryAddress,
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: order.customer.phone || "01711111111",
      cus_fax: "01711111111",
      ship_name: order.customer.name || "Customer",
      ship_add1: order.deliveryAddress,
      ship_add2: order.deliveryAddress,
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1e3,
      ship_country: "Bangladesh"
    };
    sslcommerz.init(data).then((apiResponse) => {
      let GatewayPageURL = apiResponse.GatewayPageURL;
      if (GatewayPageURL) {
        return res.status(200).json({ success: true, url: GatewayPageURL });
      } else {
        return res.status(400).json({ success: false, message: "Failed to initialize payment gateway" });
      }
    }).catch((error) => {
      console.error("SSLCommerz init error:", error);
      return res.status(500).json({ success: false, message: "Failed to initialize payment gateway" });
    });
  } catch (error) {
    console.error("Payment init error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
var paymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;
    const order = await prisma_default.order.update({
      where: { transactionId: tran_id },
      data: {
        paymentStatus: "SUCCESS",
        status: "PLACED"
      }
    });
    res.redirect(`${config.frontendUrl}/checkout/success?orderId=${order.id}`);
  } catch (error) {
    console.error("Payment success error:", error);
    res.redirect(`${config.frontendUrl}/checkout/fail`);
  }
};
var paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.params;
    await prisma_default.order.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: "FAILED" }
    });
    res.redirect(`${config.frontendUrl}/checkout/fail`);
  } catch (error) {
    console.error("Payment fail error:", error);
    res.redirect(`${config.frontendUrl}/checkout/fail`);
  }
};
var paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.params;
    await prisma_default.order.update({
      where: { transactionId: tran_id },
      data: { paymentStatus: "CANCELLED" }
    });
    res.redirect(`${config.frontendUrl}/checkout/cancel`);
  } catch (error) {
    console.error("Payment cancel error:", error);
    res.redirect(`${config.frontendUrl}/checkout/cancel`);
  }
};
var paymentIpn = async (req, res) => {
  try {
    const { status, tran_id } = req.body;
    if (status === "VALID" && tran_id) {
      await prisma_default.order.update({
        where: { transactionId: tran_id },
        data: { paymentStatus: "SUCCESS" }
      });
    }
    return res.status(200).json({ message: "IPN received" });
  } catch (error) {
    console.error("IPN error:", error);
    return res.status(500).json({ message: "IPN processing error" });
  }
};

// src/routes/payment.routes.ts
var router2 = Router2();
router2.post("/init", authMiddleware, initPayment);
router2.post("/success/:tran_id", paymentSuccess);
router2.post("/fail/:tran_id", paymentFail);
router2.post("/cancel/:tran_id", paymentCancel);
router2.post("/ipn", paymentIpn);
var payment_routes_default = router2;

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

// src/middlewares/requireRole.ts
import { Role } from "@prisma/client";
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
var requireProvider = requireRole(Role.PROVIDER);
var requireCustomer = requireRole(Role.CUSTOMER);

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
import { Router as Router13 } from "express";

// src/routes/provider.routes.ts
import { Router as Router3 } from "express";

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
  const profile = await prisma_default.providerProfile.findFirst({
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
    meals: profile.meals.map((m) => ({
      ...m,
      providerProfile: {
        businessName: profile.businessName,
        id: profile.id,
        logo: profile.logo
      }
    })),
    avgRating: ratingStats._avg.rating ?? 0,
    totalReviews: ratingStats._count
  };
};
var getAllProviders = async (query) => {
  const { search, cuisineType } = query;
  const pageNum = Number(query.page) || 1;
  const limitNum = Number(query.limit) || 10;
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
  const skip = (pageNum - 1) * limitNum;
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
      take: limitNum
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
    _count: { _all: true }
  });
  const mealToRating = {};
  ratings.forEach((r) => {
    mealToRating[r.mealId] = { avg: r._avg.rating ?? 0, count: r._count._all };
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
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
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
    if (error.name === "NotFoundError" || error.statusCode === 404) {
      sendSuccess(res, null, "No profile found");
      return;
    }
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
  const { categoryId, providerId, search, minPrice, maxPrice, dietaryPreference, isAvailable, sort, page, limit } = query;
  const where = {};
  if (categoryId) where["categoryId"] = categoryId;
  if (providerId) where["providerProfileId"] = providerId;
  if (isAvailable !== void 0) where["isAvailable"] = isAvailable;
  if (dietaryPreference) where["dietaryPreference"] = dietaryPreference;
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
  let sortedMeals = meals;
  if (sort === "rating") {
    sortedMeals = [...meals].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
  } else if (sort === "popular") {
    sortedMeals = [...meals].sort((a, b) => b._count.orderItems - a._count.orderItems);
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
  return {
    ...meal,
    avgRating: meal.avgRating || 4.5,
    totalReviews: meal._count.reviews,
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
  totalAmount += 60;
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
var cancelOrder = async (orderId, userId) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId }
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.customerId !== userId) {
    throw new ForbiddenError("You can only cancel your own orders");
  }
  if (order.status !== "PLACED") {
    throw new BadRequestError(
      `Cannot cancel order with status ${order.status}. Only PLACED orders can be cancelled.`
    );
  }
  const updatedOrder = await prisma_default.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
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
    }
  });
  return updatedOrder;
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
var cancelOrder2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params["id"];
    const order = await cancelOrder(orderId, userId);
    sendSuccess(res, order, "Order cancelled successfully");
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
var DietaryPreferenceOptions = ["REGULAR", "VEGETARIAN", "VEGAN", "GLUTEN_FREE", "KETO", "HALAL"];
var createMealSchema = z2.object({
  name: z2.string().min(2, "Meal name must be at least 2 characters").max(100, "Meal name must be at most 100 characters"),
  description: z2.string().max(1e3, "Description must be at most 1000 characters").optional(),
  price: z2.number().positive("Price must be a positive number").max(99999.99, "Price is too high"),
  image: z2.string().url("Image must be a valid URL").optional(),
  categoryId: z2.string().cuid("Invalid category ID"),
  dietaryPreference: z2.enum(DietaryPreferenceOptions).optional().default("REGULAR"),
  isAvailable: z2.boolean().optional().default(true)
});
var updateMealSchema = z2.object({
  name: z2.string().min(2, "Meal name must be at least 2 characters").max(100, "Meal name must be at most 100 characters").optional(),
  description: z2.string().max(1e3, "Description must be at most 1000 characters").optional(),
  price: z2.number().positive("Price must be a positive number").max(99999.99, "Price is too high").optional(),
  image: z2.string().url("Image must be a valid URL").optional(),
  categoryId: z2.string().cuid("Invalid category ID").optional(),
  dietaryPreference: z2.enum(DietaryPreferenceOptions).optional(),
  isAvailable: z2.boolean().optional()
});
var mealQuerySchema = z2.object({
  categoryId: z2.string().cuid().optional(),
  providerId: z2.string().cuid().optional(),
  search: z2.string().optional(),
  minPrice: z2.coerce.number().positive().optional(),
  maxPrice: z2.coerce.number().positive().optional(),
  dietaryPreference: z2.enum(DietaryPreferenceOptions).optional(),
  isAvailable: z2.coerce.boolean().optional(),
  sort: z2.enum(SortOptions).optional().default("newest"),
  page: z2.coerce.number().int().positive().default(1),
  limit: z2.coerce.number().int().positive().max(100).default(50)
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
var router3 = Router3();
router3.get("/profile", authMiddleware, requireProvider, getMyProfile);
router3.post("/profile", authMiddleware, requireProvider, validateBody(createProviderProfileSchema), createProfile2);
router3.put("/profile", authMiddleware, requireProvider, validateBody(updateProviderProfileSchema), updateMyProfile);
router3.get("/meals", authMiddleware, requireProvider, getMyMeals);
router3.post("/meals", authMiddleware, requireProvider, validateBody(createMealSchema), createMeal2);
router3.put("/meals/:id", authMiddleware, requireProvider, validateParams(mealIdParamSchema), validateBody(updateMealSchema), updateMeal2);
router3.delete("/meals/:id", authMiddleware, requireProvider, validateParams(mealIdParamSchema), deleteMeal2);
router3.get("/orders", authMiddleware, requireProvider, validateQuery(orderQuerySchema), getProviderOrders2);
router3.get("/orders/:id", authMiddleware, requireProvider, validateParams(orderIdParamSchema), getProviderOrderById2);
router3.patch("/orders/:id/status", authMiddleware, requireProvider, validateParams(orderIdParamSchema), validateBody(updateOrderStatusSchema), updateOrderStatus2);
var provider_routes_default = router3;

// src/routes/meal.routes.ts
import { Router as Router4 } from "express";

// src/services/review.service.ts
var updateMealRating = async (mealId) => {
  const aggregate = await prisma_default.review.aggregate({
    where: { mealId },
    _avg: { rating: true },
    _count: { rating: true }
  });
  let avgRating = 0;
  if (aggregate._count.rating > 0 && aggregate._avg.rating !== null) {
    avgRating = Number(aggregate._avg.rating.toFixed(1));
  }
  const meal = await prisma_default.meal.findUnique({
    where: { id: mealId },
    select: { providerProfileId: true }
  });
  if (!meal) {
    return;
  }
  await prisma_default.meal.update({
    where: { id: mealId },
    data: { avgRating }
  });
  if (meal.providerProfileId) {
    await updateProviderRating(meal.providerProfileId);
  }
};
var updateProviderRating = async (providerProfileId) => {
  const aggregate = await prisma_default.review.aggregate({
    where: { meal: { providerProfileId } },
    _avg: { rating: true },
    _count: { rating: true }
  });
  let rating = 0;
  if (aggregate._count.rating > 0 && aggregate._avg.rating !== null) {
    rating = Number(aggregate._avg.rating.toFixed(1));
  }
  await prisma_default.providerProfile.update({
    where: { id: providerProfileId },
    data: { rating }
  });
};
var createOrderReview = async (userId, orderId, data) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: true
    }
  });
  if (!order) {
    throw new NotFoundError("Order not found");
  }
  if (order.customerId !== userId) {
    throw new ForbiddenError("You can only rate your own orders");
  }
  const reviews = await Promise.all(
    order.orderItems.map(async (item) => {
      const review = await prisma_default.review.upsert({
        where: {
          userId_mealId: {
            userId,
            mealId: item.mealId
          }
        },
        update: {
          rating: data.rating,
          comment: data.comment ?? null
        },
        create: {
          userId,
          mealId: item.mealId,
          rating: data.rating,
          comment: data.comment ?? null
        }
      });
      await updateMealRating(item.mealId);
      return review;
    })
  );
  return { message: "Reviews submitted successfully", count: reviews.length };
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
      averageRating: avgResult._avg.rating ? Number(avgResult._avg.rating.toFixed(1)) : 0
    }
  };
};

// src/controllers/review.controller.ts
var createOrderReview2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params["id"];
    const result = await createOrderReview(userId, orderId, req.body);
    sendCreated(res, result, "Order rated successfully");
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

// src/validations/review.validation.ts
import { z as z4 } from "zod";
var createReviewSchema = z4.object({
  mealId: z4.string().cuid("Invalid meal ID"),
  rating: z4.number().int("Rating must be an integer").min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comment: z4.string().max(1e3, "Comment is too long").optional()
});
var createOrderReviewSchema = z4.object({
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
var router4 = Router4();
router4.get("/", validateQuery(mealQuerySchema), getMeals2);
router4.get("/:id", validateParams(mealIdParamSchema), getMealById2);
router4.get("/:mealId/reviews", validateParams(mealIdParamSchema2), validateQuery(reviewQuerySchema), getMealReviews2);
var meal_routes_default = router4;

// src/routes/order.routes.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.post(
  "/",
  authMiddleware,
  requireCustomer,
  validateBody(createOrderSchema),
  createOrder2
);
router5.get(
  "/",
  authMiddleware,
  requireCustomer,
  validateQuery(orderQuerySchema),
  getCustomerOrders2
);
router5.get(
  "/:id",
  authMiddleware,
  requireCustomer,
  validateParams(orderIdParamSchema),
  getCustomerOrderById2
);
router5.patch(
  "/:id/cancel",
  authMiddleware,
  requireCustomer,
  validateParams(orderIdParamSchema),
  cancelOrder2
);
router5.post(
  "/:id/reviews",
  authMiddleware,
  requireCustomer,
  validateParams(orderIdParamSchema),
  validateBody(createOrderReviewSchema),
  createOrderReview2
);
var order_routes_default = router5;

// src/routes/category.routes.ts
import { Router as Router6 } from "express";

// src/services/category.service.ts
var getCategories = async (query) => {
  const { search, isFeatured, page, limit } = query;
  const where = {};
  if (search) {
    where["OR"] = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  if (isFeatured !== void 0) {
    where["isFeatured"] = isFeatured;
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
      image: data.image ?? null,
      isFeatured: data.isFeatured ?? false
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
  if (data.isFeatured !== void 0) updateData["isFeatured"] = data.isFeatured;
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

// src/validations/category.validation.ts
import { z as z5 } from "zod";
var createCategorySchema = z5.object({
  name: z5.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters"),
  description: z5.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z5.string().url("Image must be a valid URL").optional(),
  isFeatured: z5.boolean().default(false).optional()
});
var updateCategorySchema = z5.object({
  name: z5.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters").optional(),
  description: z5.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z5.string().url("Image must be a valid URL").nullable().optional(),
  isFeatured: z5.boolean().optional()
});
var categoryIdParamSchema = z5.object({
  id: z5.string().cuid("Invalid category ID")
});
var categoryQuerySchema = z5.object({
  search: z5.string().optional(),
  isFeatured: z5.preprocess((val) => val === "true" || val === true, z5.boolean()).optional(),
  page: z5.coerce.number().int().positive().default(1),
  limit: z5.coerce.number().int().positive().max(100).default(20)
});

// src/routes/category.routes.ts
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
import { z as z6 } from "zod";
var providerQuerySchema = z6.object({
  search: z6.string().optional(),
  cuisineType: z6.string().optional(),
  page: z6.coerce.number().int().positive().default(1),
  limit: z6.coerce.number().int().positive().max(100).default(10)
});
var providerIdParamSchema = z6.object({
  id: z6.string().cuid("Invalid provider ID")
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
  validateParams(providerIdParamSchema),
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
      address: true,
      phone: true,
      createdAt: true,
      providerProfile: { select: { id: true } },
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
  if (data.address !== void 0) updateData["address"] = data.address;
  if (data.phone !== void 0) updateData["phone"] = data.phone;
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
      address: true,
      phone: true,
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
var getDashboardStats = async (userId) => {
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
    const stats = await getDashboardStats(userId);
    sendSuccess(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/validations/user.validation.ts
import { z as z7 } from "zod";
var updateProfileSchema = z7.object({
  name: z7.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters").optional(),
  image: z7.union([z7.string().url("Image must be a valid URL"), z7.literal("")]).nullable().optional(),
  address: z7.string().max(200, "Address must be at most 200 characters").optional().or(z7.literal("")),
  phone: z7.string().max(20, "Phone number must be at most 20 characters").optional().or(z7.literal(""))
});

// src/routes/user.routes.ts
var router8 = Router8();
router8.use(authMiddleware);
router8.get("/profile", getProfile2);
router8.patch(
  "/profile",
  validateBody(updateProfileSchema),
  updateProfile3
);
router8.get("/dashboard", getDashboard);
router8.get("/orders", getOrderHistory2);
var user_routes_default = router8;

// src/routes/upload.routes.ts
import { Router as Router9 } from "express";
import multer from "multer";
import path from "path";
import fs2 from "fs";

// src/utils/cloudinary.util.ts
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
var isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}
var uploadToCloudinary = async (fileInput, originalName) => {
  if (!isCloudinaryConfigured) {
    return null;
  }
  try {
    if (Buffer.isBuffer(fileInput)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "foodhub_uploads", resource_type: "auto" },
          (error, result) => {
            if (error) return reject(new Error("Failed to upload image buffer to Cloudinary"));
            resolve(result?.secure_url || null);
          }
        );
        uploadStream.end(fileInput);
      });
    }
    const localFilePath = fileInput;
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "foodhub_uploads",
      resource_type: "auto"
    });
    try {
      fs.unlinkSync(localFilePath);
    } catch (unlinkError) {
      console.error("Failed to delete local file after Cloudinary upload", unlinkError);
    }
    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    if (typeof fileInput === "string") {
      try {
        if (fs.existsSync(fileInput)) {
          fs.unlinkSync(fileInput);
        }
      } catch (e) {
      }
    }
    throw new Error("Failed to upload image to Cloudinary");
  }
};

// src/routes/upload.routes.ts
var router9 = Router9();
var isVercel = process.env["VERCEL"] === "1";
var uploadDir = isVercel ? "/tmp" : path.join(process.cwd(), "uploads");
if (!isVercel && !fs2.existsSync(uploadDir)) {
  fs2.mkdirSync(uploadDir, { recursive: true });
}
var storage = process.env["VERCEL"] === "1" ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
var fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
  }
};
var upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB limit
  fileFilter
  // Cast to any to avoid strict type mismatch with multer types
});
router9.post("/", upload.single("file"), async (req, res) => {
  const multerReq = req;
  try {
    if (!multerReq.file) {
      return sendError(res, "No file uploaded", 400);
    }
    const fileInput = multerReq.file.buffer || multerReq.file.path;
    const cloudinaryUrl = await uploadToCloudinary(fileInput, multerReq.file.originalname);
    if (cloudinaryUrl) {
      return sendSuccess(res, { url: cloudinaryUrl }, "File uploaded successfully to Cloudinary");
    }
    if (multerReq.file.filename) {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${multerReq.file.filename}`;
      return sendSuccess(res, { url: fileUrl }, "File uploaded successfully laterally");
    } else {
      return sendError(res, "Cloudinary configuration is missing for memory uploads", 500);
    }
  } catch (error) {
    console.error("Upload error:", error);
    sendError(res, "File upload failed", 500);
  }
});
var upload_routes_default = router9;

// src/routes/admin.routes.ts
import { Router as Router10 } from "express";

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
var deleteUser = async (adminId, userId) => {
  if (adminId === userId) {
    throw new BadRequestError("You cannot delete yourself");
  }
  const user = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (user.role === "ADMIN") {
    throw new ForbiddenError("Cannot delete other administrators");
  }
  await prisma_default.user.delete({
    where: { id: userId }
  });
  return { message: "User deleted successfully" };
};
var deleteProvider = async (providerId) => {
  const provider = await prisma_default.providerProfile.findUnique({
    where: { id: providerId }
  });
  if (!provider) {
    throw new NotFoundError("Provider not found");
  }
  await prisma_default.providerProfile.delete({
    where: { id: providerId }
  });
  return { message: "Provider deleted successfully" };
};
var getProviders2 = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const where = {};
  if (query.cuisineType) {
    where["cuisineType"] = { contains: query.cuisineType, mode: "insensitive" };
  }
  if (query.search) {
    where["OR"] = [
      { businessName: { contains: query.search, mode: "insensitive" } },
      { contactEmail: { contains: query.search, mode: "insensitive" } },
      { cuisineType: { contains: query.search, mode: "insensitive" } }
    ];
  }
  const skip = (page - 1) * limit;
  const [providers, total] = await Promise.all([
    prisma_default.providerProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, banned: true }
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
  return {
    providers,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateProviderStatus = async (providerId, isActive) => {
  const provider = await prisma_default.providerProfile.findUnique({
    where: { id: providerId }
  });
  if (!provider) {
    throw new NotFoundError("Provider not found");
  }
  return prisma_default.providerProfile.update({
    where: { id: providerId },
    data: { isActive },
    include: {
      user: {
        select: { id: true, name: true, email: true, banned: true }
      }
    }
  });
};
var getAllMeals = async (query) => {
  const { search, categoryId, page, limit } = query;
  const where = {};
  if (search) {
    where["OR"] = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }
  if (categoryId) {
    where["categoryId"] = categoryId;
  }
  const skip = (page - 1) * limit;
  const [meals, total] = await Promise.all([
    prisma_default.meal.findMany({
      where,
      include: {
        providerProfile: {
          select: { id: true, businessName: true }
        },
        category: {
          select: { id: true, name: true }
        },
        _count: {
          select: { reviews: true, orderItems: true }
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit
    }),
    prisma_default.meal.count({ where })
  ]);
  return {
    meals,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var deleteMeal3 = async (mealId) => {
  const meal = await prisma_default.meal.findUnique({
    where: { id: mealId }
  });
  if (!meal) {
    throw new NotFoundError("Meal not found");
  }
  await prisma_default.meal.delete({
    where: { id: mealId }
  });
  return { message: "Meal deleted successfully" };
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
var getOrderById = async (orderId) => {
  const order = await prisma_default.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: { id: true, name: true, email: true, phone: true }
      },
      providerProfile: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
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
  return order;
};
var getDashboardStats2 = async () => {
  const [
    totalUsers,
    totalProviders,
    totalOrders,
    totalMeals,
    recentOrders,
    orderStats,
    revenueData
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
    }),
    prisma_default.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { totalAmount: true }
    })
  ]);
  const totalRevenue = revenueData?._sum?.totalAmount || 0;
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
    totalRevenue,
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
var getOrderById2 = async (req, res, next) => {
  try {
    const orderId = req.params["id"];
    const order = await getOrderById(orderId);
    sendSuccess(res, order, "Order fetched successfully");
  } catch (error) {
    next(error);
  }
};
var getDashboardStats3 = async (req, res, next) => {
  try {
    const stats = await getDashboardStats2();
    sendSuccess(res, stats, "Dashboard stats fetched successfully");
  } catch (error) {
    next(error);
  }
};
var deleteUser2 = async (req, res, next) => {
  try {
    const adminId = req.user.id;
    const userId = req.params["id"];
    const result = await deleteUser(adminId, userId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
var deleteProvider2 = async (req, res, next) => {
  try {
    const providerId = req.params["id"];
    const result = await deleteProvider(providerId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
var getProviders3 = async (req, res, next) => {
  try {
    const result = await getProviders2(req.query);
    sendSuccess(res, result.providers, "Providers fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var updateProviderStatus2 = async (req, res, next) => {
  try {
    const providerId = req.params["id"];
    const provider = await updateProviderStatus(providerId, Boolean(req.body.isActive));
    sendSuccess(res, provider, provider.isActive ? "Provider activated successfully" : "Provider suspended successfully");
  } catch (error) {
    next(error);
  }
};
var getAllMeals2 = async (req, res, next) => {
  try {
    const query = res.locals["validatedQuery"] || req.query;
    const result = await getAllMeals(query);
    sendSuccess(res, result.meals, "Meals fetched successfully", 200, result.meta);
  } catch (error) {
    next(error);
  }
};
var deleteMeal4 = async (req, res, next) => {
  try {
    const mealId = req.params["id"];
    const result = await deleteMeal3(mealId);
    sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};

// src/validations/admin.validation.ts
import { z as z8 } from "zod";
var RoleValues = ["CUSTOMER", "PROVIDER", "ADMIN"];
var userListQuerySchema = z8.object({
  role: z8.enum(RoleValues).optional(),
  search: z8.string().optional(),
  isBanned: z8.coerce.boolean().optional(),
  page: z8.coerce.number().int().positive().default(1),
  limit: z8.coerce.number().int().positive().max(100).default(10)
});
var banUserSchema = z8.object({
  banned: z8.boolean(),
  banReason: z8.string().max(500, "Ban reason is too long").optional()
});
var userIdParamSchema = z8.object({
  id: z8.string().min(1, "Invalid user ID")
});
var providerIdParamSchema2 = z8.object({
  id: z8.string().min(1, "Invalid provider ID")
});
var adminOrderQuerySchema = z8.object({
  status: z8.enum(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
  providerId: z8.string().min(1).optional(),
  customerId: z8.string().min(1).optional(),
  page: z8.coerce.number().int().positive().default(1),
  limit: z8.coerce.number().int().positive().max(100).default(10)
});

// src/routes/admin.routes.ts
var router10 = Router10();
router10.use(authMiddleware, requireAdmin);
router10.get("/dashboard", getDashboardStats3);
router10.get("/users", validateQuery(userListQuerySchema), getUsers2);
router10.get("/users/:id", validateParams(userIdParamSchema), getUserById2);
router10.patch("/users/:id/ban", validateParams(userIdParamSchema), validateBody(banUserSchema), banUser2);
router10.delete("/users/:id", validateParams(userIdParamSchema), deleteUser2);
router10.get("/providers", getProviders3);
router10.patch("/providers/:id/status", validateParams(providerIdParamSchema2), updateProviderStatus2);
router10.delete("/providers/:id", validateParams(providerIdParamSchema2), deleteProvider2);
router10.get("/meals", validateQuery(mealQuerySchema), getAllMeals2);
router10.delete("/meals/:id", validateParams(mealIdParamSchema), deleteMeal4);
router10.get("/orders", validateQuery(adminOrderQuerySchema), getAllOrders2);
router10.get("/orders/:id", validateParams(userIdParamSchema), getOrderById2);
router10.post("/categories", validateBody(createCategorySchema), createCategory2);
router10.put("/categories/:id", validateParams(categoryIdParamSchema), validateBody(updateCategorySchema), updateCategory2);
router10.delete("/categories/:id", validateParams(categoryIdParamSchema), deleteCategory2);
var admin_routes_default = router10;

// src/routes/analytics.routes.ts
import { Router as Router11 } from "express";

// src/services/analytics.service.ts
import { startOfDay, subDays, format, eachDayOfInterval } from "date-fns";
var getAdminAnalytics = async (days = 30) => {
  const startDate = subDays(startOfDay(/* @__PURE__ */ new Date()), days);
  const orders = await prisma_default.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: "DELIVERED"
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });
  const dayInterval = eachDayOfInterval({
    start: startDate,
    end: /* @__PURE__ */ new Date()
  });
  const timeSeries = dayInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOrders = orders.filter((o) => format(o.createdAt, "yyyy-MM-dd") === dateStr);
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      orders: dayOrders.length
    };
  });
  const categoryStats = await prisma_default.orderItem.groupBy({
    by: ["mealId"],
    _count: true,
    where: {
      order: { status: "DELIVERED" }
    }
  });
  const meals = await prisma_default.meal.findMany({
    where: { id: { in: categoryStats.map((s) => s.mealId) } },
    include: { category: true }
  });
  const categoryDistribution = {};
  categoryStats.forEach((stat) => {
    const meal = meals.find((m) => m.id === stat.mealId);
    const catName = meal?.category?.name || "Unknown";
    categoryDistribution[catName] = (categoryDistribution[catName] || 0) + stat._count;
  });
  return {
    timeSeries,
    categoryDistribution: Object.entries(categoryDistribution).map(([name, value]) => ({ name, value })),
    topProviders: await getTopProviders(5)
  };
};
var getProviderAnalytics = async (providerId, days = 30) => {
  const startDate = subDays(startOfDay(/* @__PURE__ */ new Date()), days);
  const orders = await prisma_default.order.findMany({
    where: {
      providerProfileId: providerId,
      createdAt: { gte: startDate },
      status: "DELIVERED"
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });
  const dayInterval = eachDayOfInterval({
    start: startDate,
    end: /* @__PURE__ */ new Date()
  });
  const timeSeries = dayInterval.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOrders = orders.filter((o) => format(o.createdAt, "yyyy-MM-dd") === dateStr);
    return {
      date: dateStr,
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      orders: dayOrders.length
    };
  });
  const topMeals = await prisma_default.orderItem.groupBy({
    by: ["mealId"],
    where: {
      order: {
        providerProfileId: providerId,
        status: "DELIVERED"
      }
    },
    _count: true,
    orderBy: {
      _count: {
        mealId: "desc"
      }
    },
    take: 5
  });
  const mealDetails = await prisma_default.meal.findMany({
    where: { id: { in: topMeals.map((m) => m.mealId) } },
    select: { id: true, name: true }
  });
  return {
    timeSeries,
    topMeals: topMeals.map((m) => ({
      name: mealDetails.find((d) => d.id === m.mealId)?.name || "Unknown",
      orders: m._count
    }))
  };
};
async function getTopProviders(limit) {
  const topProviders = await prisma_default.order.groupBy({
    by: ["providerProfileId"],
    where: { status: "DELIVERED" },
    _sum: { totalAmount: true },
    orderBy: {
      _sum: { totalAmount: "desc" }
    },
    take: limit
  });
  const profiles = await prisma_default.providerProfile.findMany({
    where: { id: { in: topProviders.map((p) => p.providerProfileId) } },
    select: { id: true, businessName: true }
  });
  return topProviders.map((p) => ({
    name: profiles.find((profile) => profile.id === p.providerProfileId)?.businessName || "Unknown",
    revenue: Number(p._sum.totalAmount)
  }));
}

// src/controllers/analytics.controller.ts
var getAdminAnalytics2 = async (req, res, next) => {
  try {
    const days = req.query["days"] ? parseInt(req.query["days"]) : 30;
    const stats = await getAdminAnalytics(days);
    sendSuccess(res, stats, "Admin analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};
var getProviderAnalytics2 = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const providerProfile = await prisma_default.providerProfile.findUnique({
      where: { userId }
    });
    if (!providerProfile) {
      throw new ForbiddenError("Provider profile not found");
    }
    const days = req.query["days"] ? parseInt(req.query["days"]) : 30;
    const stats = await getProviderAnalytics(providerProfile.id, days);
    sendSuccess(res, stats, "Provider analytics fetched successfully");
  } catch (error) {
    next(error);
  }
};

// src/routes/analytics.routes.ts
var router11 = Router11();
router11.get("/admin", authMiddleware, requireRole("ADMIN"), getAdminAnalytics2);
router11.get("/provider", authMiddleware, requireRole("PROVIDER"), getProviderAnalytics2);
var analytics_routes_default = router11;

// src/routes/ai.routes.ts
import { Router as Router12 } from "express";
import { PrismaClient as PrismaClient4 } from "@prisma/client";

// src/services/ai.service.ts
import { PrismaClient as PrismaClient2 } from "@prisma/client";

// src/lib/ai/index.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from "@huggingface/inference";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
var genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
var geminiModel = genAI.getGenerativeModel({ model: process.env.CRAVELY_GEMINI_MODEL || "gemini-2.0-flash" });
var nvidiaClient = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || "",
  baseURL: "https://integrate.api.nvidia.com/v1"
});
var hf = new HfInference(process.env.HF_API_KEY || "");
async function generateEmbedding(text) {
  try {
    const response = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text
    });
    return response;
  } catch (error) {
    if (error?.httpResponse?.status === 401) {
      console.error("\u274C Hugging Face 401 Unauthorized: Your HF_API_KEY is invalid or expired.");
    } else {
      console.error("Embedding generation failed:", error);
    }
    throw new Error("Failed to generate embedding");
  }
}
function bufferToVector(buffer) {
  return Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
}
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i] ?? 0;
    const b = vecB[i] ?? 0;
    dotProduct += a * b;
    mA += a * a;
    mB += b * b;
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

// src/services/ai.service.ts
var prisma2 = new PrismaClient2();
var AIService = class {
  /**
   * Finds meals similar to a given meal ID
   */
  static async getRelatedMeals(mealId, limit = 5) {
    const targetEmbedding = await prisma2.mealEmbedding.findUnique({
      where: { mealId }
    });
    if (!targetEmbedding) return [];
    const targetVector = bufferToVector(targetEmbedding.embedding);
    const allEmbeddings = await prisma2.mealEmbedding.findMany({
      where: { mealId: { not: mealId } },
      include: {
        meal: {
          include: {
            category: true,
            providerProfile: true
          }
        }
      }
    });
    const scoredMeals = allEmbeddings.map((emb) => {
      const vector = bufferToVector(emb.embedding);
      const similarity = cosineSimilarity(targetVector, vector);
      return {
        ...emb.meal,
        similarity
      };
    });
    return scoredMeals.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
  /**
   * Personalized recommendations based on user's order history
   */
  static async getPersonalizedRecommendations(userId, limit = 5) {
    const lastOrders = await prisma2.order.findMany({
      where: { customerId: userId, status: "DELIVERED" },
      include: {
        orderItems: {
          include: {
            meal: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 3
    });
    if (lastOrders.length === 0) {
      return prisma2.meal.findMany({
        take: limit,
        orderBy: { avgRating: "desc" },
        include: { category: true, providerProfile: true }
      });
    }
    const historyMealIds = lastOrders.flatMap((o) => o.orderItems.map((i) => i.mealId));
    const historyEmbeddings = await prisma2.mealEmbedding.findMany({
      where: { mealId: { in: historyMealIds } }
    });
    if (historyEmbeddings.length === 0) {
      return prisma2.meal.findMany({
        take: limit,
        orderBy: { avgRating: "desc" },
        include: { category: true, providerProfile: true }
      });
    }
    const vectors = historyEmbeddings.map((emb) => bufferToVector(emb.embedding));
    const firstVector = vectors[0];
    if (!firstVector) {
      return this.getTrendingMeals(limit);
    }
    const vectorLength = firstVector.length;
    const averageVector = new Array(vectorLength).fill(0);
    for (const vector of vectors) {
      for (let i = 0; i < vectorLength; i++) {
        averageVector[i] = (averageVector[i] ?? 0) + (vector[i] || 0);
      }
    }
    for (let i = 0; i < vectorLength; i++) {
      averageVector[i] = (averageVector[i] ?? 0) / vectors.length;
    }
    const allEmbeddings = await prisma2.mealEmbedding.findMany({
      where: { mealId: { notIn: historyMealIds } },
      include: {
        meal: {
          include: {
            category: true,
            providerProfile: true
          }
        }
      }
    });
    const scoredMeals = allEmbeddings.map((emb) => {
      const vector = bufferToVector(emb.embedding);
      const similarity = cosineSimilarity(averageVector, vector);
      return {
        ...emb.meal,
        similarity
      };
    });
    return scoredMeals.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  }
  /**
   * Cold-start fallback based on recent order volume and rating.
   */
  static async getTrendingMeals(limit = 8, days = 7) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
    const meals = await prisma2.meal.findMany({
      where: { isAvailable: true },
      include: {
        category: true,
        providerProfile: true,
        orderItems: {
          where: {
            order: {
              createdAt: { gte: since },
              status: { not: "CANCELLED" }
            }
          },
          select: { id: true }
        }
      }
    });
    return meals.map((meal) => ({
      ...meal,
      recentOrders: meal.orderItems.length,
      score: meal.orderItems.length * 2 + (meal.avgRating || 0)
    })).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  static async getRecommendations(input) {
    const limit = input.limit ?? 8;
    if (input.context === "detail" && input.mealId) {
      const data2 = await this.getRelatedMeals(input.mealId, limit);
      return { data: data2, personalized: false, cacheHit: false };
    }
    if (input.userId) {
      const data2 = await this.getPersonalizedRecommendations(input.userId, limit);
      return { data: data2, personalized: true, cacheHit: false };
    }
    const data = await this.getTrendingMeals(limit);
    return { data, personalized: false, cacheHit: false };
  }
  /**
   * Search suggestions using a hybrid approach (Keyword + Semantic)
   */
  static async getSearchSuggestions(query, limit = 5) {
    try {
      const keywordMatches = await prisma2.meal.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        take: limit
      });
      let semanticMatches = [];
      try {
        const queryEmbedding = await generateEmbedding(query);
        const allEmbeddings = await prisma2.mealEmbedding.findMany({
          include: { meal: true }
        });
        semanticMatches = allEmbeddings.map((emb) => {
          const vector = bufferToVector(emb.embedding);
          const similarity = cosineSimilarity(queryEmbedding, vector);
          return {
            id: emb.meal.id,
            name: emb.meal.name,
            image: emb.meal.image,
            similarity
          };
        }).filter((s) => s.similarity > 0.4).sort((a, b) => b.similarity - a.similarity);
      } catch (err) {
        console.warn("Semantic search failed, falling back to keyword matches:", err);
      }
      const combined = [...semanticMatches];
      for (const km of keywordMatches) {
        if (!combined.some((s) => s.id === km.id)) {
          combined.push({
            id: km.id,
            name: km.name,
            image: km.image,
            similarity: 1
            // High priority for exact keyword matches
          });
        }
      }
      return combined.slice(0, limit);
    } catch (error) {
      console.error("Search suggestions fatal error:", error);
      return [];
    }
  }
};

// src/services/cravely.service.ts
import { PrismaClient as PrismaClient3 } from "@prisma/client";
var prisma3 = new PrismaClient3();
var RATE_LIMIT_WINDOW_MS = 60 * 60 * 1e3;
var RATE_LIMIT_MAX = 30;
var rateLimit = /* @__PURE__ */ new Map();
var SYSTEM_PROMPT = `You are Cravely, the friendly AI assistant for FoodHub.
You help customers discover meals that match cravings, budget, and dietary needs.

Rules:
- ONLY recommend meals present in the provided context.
- Mention a meal with <cite id="MEAL_ID"/> immediately after its name.
- If no context meal matches, say so honestly and suggest browsing FoodHub.
- Keep responses short, warm, and useful.
- You cannot place orders; tell users to add meals to cart and checkout.
- Redirect off-topic requests back to food.`;
function isConfigured(value) {
  return !!value && value.length > 12 && !value.includes("YOUR_");
}
function validateCitations(text, allowedIds) {
  const allowed = new Set(allowedIds);
  const citations = /* @__PURE__ */ new Set();
  const cleaned = text.replace(/<cite\s+id=["']([^"']+)["']\s*\/?>/g, (match, id) => {
    if (!allowed.has(id)) return "";
    citations.add(id);
    return match;
  });
  return { content: cleaned.trim(), citations: Array.from(citations) };
}
function localGroundedResponse(message, meals) {
  if (meals.length === 0) {
    return "I could not find a matching meal in FoodHub right now. Try browsing the meals page or search with a different craving.";
  }
  const budgetMatch = message.match(/(?:under|below|less than|within)\s*(\d+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1]) : null;
  const filtered = budget ? meals.filter((meal) => meal.price <= budget) : meals;
  const picks = (filtered.length > 0 ? filtered : meals).slice(0, 3);
  return picks.map((meal) => `${meal.name} <cite id="${meal.id}"/> is ${meal.category.toLowerCase()} from ${meal.provider} for BDT ${meal.price}.`).join(" ");
}
var CravelyService = class {
  static checkRateLimit(key) {
    const now = Date.now();
    const existing = rateLimit.get(key);
    if (!existing || existing.resetAt <= now) {
      rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    }
    if (existing.count >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }
    existing.count += 1;
    return { allowed: true, remaining: RATE_LIMIT_MAX - existing.count, resetAt: existing.resetAt };
  }
  static async getContextMeals(message, limit = 8) {
    const suggestions = await AIService.getSearchSuggestions(message, limit).catch(() => []);
    const ids = suggestions.map((suggestion) => suggestion.id);
    if (ids.length === 0) {
      const trending = await AIService.getTrendingMeals(limit);
      return trending.map((meal) => ({
        id: meal.id,
        name: meal.name,
        price: meal.price,
        rating: meal.avgRating || 0,
        category: meal.category?.name || "Meal",
        provider: meal.providerProfile?.businessName || "FoodHub",
        description: meal.description || "Freshly prepared FoodHub meal"
      }));
    }
    const meals = await prisma3.meal.findMany({
      where: { id: { in: ids }, isAvailable: true },
      include: { category: true, providerProfile: true }
    });
    const order = new Map(ids.map((id, index) => [id, index]));
    return meals.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999)).map((meal) => ({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      rating: meal.avgRating || 0,
      category: meal.category?.name || "Meal",
      provider: meal.providerProfile?.businessName || "FoodHub",
      description: meal.description || "Freshly prepared FoodHub meal"
    }));
  }
  static async chat(sessionId, message, userId) {
    const startedAt = Date.now();
    const contextMeals = await this.getContextMeals(message);
    const history = await prisma3.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 10
    });
    const context = JSON.stringify(contextMeals, null, 2);
    const prompt = `${SYSTEM_PROMPT}

<context>
${context}
</context>

<chat_history>
${history.map((item) => `${item.role}: ${item.content}`).join("\n")}
</chat_history>

<user_message>
${message}
</user_message>`;
    let provider = "local";
    let model = "local-grounded";
    let responseText = "";
    const providerPref = config.cravelyProvider.toLowerCase();
    if ((providerPref === "auto" || providerPref === "nvidia") && isConfigured(process.env["NVIDIA_API_KEY"])) {
      try {
        const completion = await nvidiaClient.chat.completions.create({
          model: config.cravelyNvidiaModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
          max_tokens: 600
        });
        responseText = completion.choices?.[0]?.message?.content ?? "";
        provider = "nvidia";
        model = config.cravelyNvidiaModel;
      } catch (error) {
        console.error("NVIDIA chat failed:", error);
      }
    }
    if (!responseText && (providerPref === "auto" || providerPref === "gemini") && isConfigured(process.env["GOOGLE_AI_API_KEY"])) {
      try {
        const result = await geminiModel.generateContent(prompt);
        responseText = result.response.text();
        provider = "gemini";
        model = config.cravelyGeminiModel;
      } catch (error) {
        console.error("Gemini chat failed:", error);
      }
    }
    if (!responseText) {
      responseText = localGroundedResponse(message, contextMeals);
    }
    const validated = validateCitations(responseText, contextMeals.map((meal) => meal.id));
    const finalText = validated.content || localGroundedResponse(message, contextMeals);
    const latencyMs = Date.now() - startedAt;
    await prisma3.chatMessage.create({
      data: { sessionId, role: "user", content: message }
    });
    await prisma3.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: finalText,
        citations: validated.citations
      }
    });
    return {
      message: finalText,
      citations: validated.citations,
      provider,
      model,
      latencyMs
    };
  }
  static async getOrCreateSession(sessionId, userId) {
    if (sessionId) {
      const session = await prisma3.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true }
      });
      if (session) return session;
    }
    return prisma3.chatSession.create({
      data: userId ? { userId } : {}
    });
  }
};

// src/routes/ai.routes.ts
var router12 = Router12();
var prisma4 = new PrismaClient4();
function parseLimit(value, fallback, max = 50) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
}
function sendSse(res, event, data) {
  res.write(`event: ${event}
`);
  res.write(`data: ${JSON.stringify(data)}

`);
}
router12.get("/recommendations/personalized", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const recommendations = await AIService.getPersonalizedRecommendations(userId, parseLimit(req.query["limit"], 8));
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Personalized recommendations failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router12.post("/recommendations", async (req, res) => {
  try {
    const context = ["home", "detail", "cart"].includes(req.body?.context) ? req.body.context : "home";
    const input = {
      context,
      limit: parseLimit(req.body?.limit, 8)
    };
    if (typeof req.user?.id === "string") input.userId = req.user.id;
    if (typeof req.body?.mealId === "string") input.mealId = req.body.mealId;
    const result = await AIService.getRecommendations(input);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Recommendations failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router12.get("/recommendations/related/:mealId", async (req, res) => {
  try {
    const mealId = req.params["mealId"];
    if (!mealId) {
      return res.status(400).json({ success: false, message: "Meal ID is required" });
    }
    const recommendations = await AIService.getRelatedMeals(mealId, parseLimit(req.query["limit"], 5));
    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error("Related meals failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router12.get("/trending", async (req, res) => {
  try {
    const meals = await AIService.getTrendingMeals(
      parseLimit(req.query["limit"], 8),
      parseLimit(req.query["days"], 7, 90)
    );
    res.json({ success: true, data: meals });
  } catch (error) {
    console.error("Trending meals failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router12.get(["/suggest", "/search/suggestions"], async (req, res) => {
  try {
    const q = req.query["q"];
    if (!q || typeof q !== "string") {
      return res.json({ success: true, data: [] });
    }
    const suggestions = await AIService.getSearchSuggestions(q, parseLimit(req.query["limit"], 5));
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error("Search suggestions failed:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router12.post("/chat", async (req, res) => {
  try {
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : void 0;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    const userId = req.user?.id;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }
    if (message.length > 1e3) {
      return res.status(400).json({ success: false, message: "Message must be 1000 characters or less" });
    }
    const limitKey = userId ?? sessionId ?? req.ip ?? "anonymous";
    const limit = CravelyService.checkRateLimit(limitKey);
    if (!limit.allowed) {
      return res.status(429).json({
        success: false,
        message: `You've hit your hourly chat limit. Resets in ${Math.ceil((limit.resetAt - Date.now()) / 6e4)} min.`
      });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    const session = await CravelyService.getOrCreateSession(sessionId, userId);
    const result = await CravelyService.chat(session.id, message, userId);
    const chunks = result.message.match(/.{1,24}(\s|$)/g) ?? [result.message];
    for (const chunk of chunks) {
      sendSse(res, "token", { text: chunk });
    }
    sendSse(res, "citations", { meals: result.citations });
    sendSse(res, "done", {
      sessionId: session.id,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      remaining: limit.remaining
    });
    res.end();
  } catch (error) {
    console.error("Cravely chat failed:", error);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "AI Assistant is currently busy. Please try again." });
    }
    sendSse(res, "error", { message: "AI Assistant is currently busy. Please try again." });
    res.end();
  }
});
router12.get("/chat/session/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    if (!id) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }
    const session = await prisma4.chatSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load history" });
  }
});
var ai_routes_default = router12;

// src/routes/index.ts
var router13 = Router13();
router13.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
router13.use("/user", user_routes_default);
router13.use("/provider", provider_routes_default);
router13.use("/meals", meal_routes_default);
router13.use("/orders", order_routes_default);
router13.use("/categories", category_routes_default);
router13.use("/providers", public_provider_routes_default);
router13.use("/upload", upload_routes_default);
router13.use("/admin", admin_routes_default);
router13.use("/analytics", analytics_routes_default);
router13.use("/ai", ai_routes_default);
var routes_default = router13;

// src/app.ts
import { fileURLToPath } from "url";
import path2 from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
app.set("trust proxy", 1);
var ALLOWED_ORIGINS = [
  "https://foodhub-frontend-sand.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000"
].filter(Boolean);
var corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
    const isVercel2 = origin.endsWith(".vercel.app");
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    if (isLocalhost || isVercel2 || isAllowed) {
      return callback(null, true);
    }
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
app.use(cors(corsOptions));
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}
var healthPayload = () => ({
  success: true,
  message: "FoodHub API is running",
  timestamp: (/* @__PURE__ */ new Date()).toISOString(),
  environment: config.nodeEnv,
  allowedOrigin: config.frontendUrl
});
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodHub API is live",
    docs: "/api/docs"
  });
});
app.get("/health", (_req, res) => res.status(200).json(healthPayload()));
app.get("/api/health", (_req, res) => res.status(200).json(healthPayload()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", auth_routes_default);
app.use("/api/payment", payment_routes_default);
app.use("/api", routes_default);
app.use((_req, res) => {
  sendNotFound(res, "Route not found");
});
app.use(errorHandler);
var app_default = app;

// src/server.ts
async function startServer() {
  try {
    const required = ["DATABASE_URL", "JWT_SECRET"];
    for (const key of required) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
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
if (process.env["VERCEL"] !== "1") {
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
  startServer();
}
var server_default = app_default;
export {
  server_default as default
};
