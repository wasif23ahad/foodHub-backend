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
  betterAuthUrl: (process.env["BETTER_AUTH_URL"] ?? "http://localhost:5000").replace(/\/$/, "") + "/api/auth",
  // CORS
  frontendUrl: (process.env["FRONTEND_URL"] ?? "http://localhost:3000").replace(/\/$/, ""),
  // Google Auth
  googleClientId: process.env["GOOGLE_CLIENT_ID"],
  googleClientSecret: process.env["GOOGLE_CLIENT_SECRET"],
  // Admin Seed
  adminEmail: process.env["ADMIN_EMAIL"] ?? "admin@foodhub.com",
  adminPassword: process.env["ADMIN_PASSWORD"] ?? "admin123"
};

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
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
  // SOCIAL PROVIDERS
  // ======================
  socialProviders: {
    google: {
      clientId: config.googleClientId || "",
      clientSecret: config.googleClientSecret || ""
    }
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
      },
      address: {
        type: "string",
        required: false,
        input: true
      },
      phone: {
        type: "string",
        required: false,
        input: true
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
    // Admin plugin removed to allow public role changes
  ],
  // ======================
  // ADVANCED OPTIONS
  // ======================
  advanced: {
    // Use secure cookies in production
    useSecureCookies: config.nodeEnv === "production"
  },
  // ======================
  // TRUSTED ORIGINS (FRONTEND_URL + deployed URL for serverless)
  // ======================
  trustedOrigins: [
    config.frontendUrl,
    "https://foodhub-frontend-sand.vercel.app",
    "http://localhost:3000"
  ].filter(Boolean)
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
import { Router as Router10 } from "express";

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
var updateMealRating = async (mealId) => {
  const aggregate = await prisma_default.review.aggregate({
    where: { mealId },
    _avg: { rating: true },
    _count: { rating: true }
  });
  let avgRating = 4.5;
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
  let rating = 4.5;
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
  await updateMealRating(data.mealId);
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
      averageRating: avgResult._avg.rating ? Number(avgResult._avg.rating.toFixed(1)) : 4.5
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
  await updateMealRating(review.mealId);
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
  await updateMealRating(review.mealId);
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
router3.patch(
  "/:id/cancel",
  requireAuth,
  validateParams(orderIdParamSchema),
  cancelOrder2
);
router3.post(
  "/:id/reviews",
  requireAuth,
  validateParams(orderIdParamSchema),
  validateBody(createOrderReviewSchema),
  createOrderReview2
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
var getDashboardStats = async () => {
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
var getDashboardStats2 = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
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
  id: z5.string().min(1, "Invalid user ID")
});
var providerIdParamSchema = z5.object({
  id: z5.string().min(1, "Invalid provider ID")
});
var adminOrderQuerySchema = z5.object({
  status: z5.enum(["PLACED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]).optional(),
  providerId: z5.string().min(1).optional(),
  customerId: z5.string().min(1).optional(),
  page: z5.coerce.number().int().positive().default(1),
  limit: z5.coerce.number().int().positive().max(100).default(10)
});

// src/validations/category.validation.ts
import { z as z6 } from "zod";
var createCategorySchema = z6.object({
  name: z6.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters"),
  description: z6.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z6.string().url("Image must be a valid URL").optional(),
  isFeatured: z6.boolean().default(false).optional()
});
var updateCategorySchema = z6.object({
  name: z6.string().min(2, "Category name must be at least 2 characters").max(50, "Category name cannot exceed 50 characters").optional(),
  description: z6.string().max(500, "Description cannot exceed 500 characters").optional(),
  image: z6.string().url("Image must be a valid URL").nullable().optional(),
  isFeatured: z6.boolean().optional()
});
var categoryIdParamSchema = z6.object({
  id: z6.string().cuid("Invalid category ID")
});
var categoryQuerySchema = z6.object({
  search: z6.string().optional(),
  isFeatured: z6.preprocess((val) => val === "true" || val === true, z6.boolean()).optional(),
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
router5.delete(
  "/users/:id",
  validateParams(userIdParamSchema),
  deleteUser2
);
router5.delete(
  "/providers/:id",
  validateParams(providerIdParamSchema),
  deleteProvider2
);
router5.get(
  "/meals",
  validateQuery(mealQuerySchema),
  getAllMeals2
);
router5.delete(
  "/meals/:id",
  validateParams(mealIdParamSchema),
  deleteMeal4
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
      address: true,
      phone: true,
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
  image: z8.union([z8.string().url("Image must be a valid URL"), z8.literal("")]).nullable().optional(),
  address: z8.string().max(200, "Address must be at most 200 characters").optional().or(z8.literal("")),
  phone: z8.string().max(20, "Phone number must be at most 20 characters").optional().or(z8.literal(""))
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
var uploadToCloudinary = async (localFilePath) => {
  if (!isCloudinaryConfigured) {
    return null;
  }
  try {
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
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (e) {
    }
    throw new Error("Failed to upload image to Cloudinary");
  }
};

// src/routes/upload.routes.ts
var router9 = Router9();
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs2.existsSync(uploadDir)) {
  fs2.mkdirSync(uploadDir, { recursive: true });
}
var storage = multer.diskStorage({
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
    const cloudinaryUrl = await uploadToCloudinary(multerReq.file.path);
    if (cloudinaryUrl) {
      return sendSuccess(res, { url: cloudinaryUrl }, "File uploaded successfully to Cloudinary");
    }
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${multerReq.file.filename}`;
    sendSuccess(res, { url: fileUrl }, "File uploaded successfully laterally");
  } catch (error) {
    console.error("Upload error:", error);
    sendError(res, "File upload failed", 500);
  }
});
var upload_routes_default = router9;

// src/routes/index.ts
var router10 = Router10();
router10.use("/user", user_routes_default);
router10.use("/provider", provider_routes_default);
router10.use("/meals", meal_routes_default);
router10.use("/orders", order_routes_default);
router10.use("/reviews", review_routes_default);
router10.use("/admin", admin_routes_default);
router10.use("/categories", category_routes_default);
router10.use("/providers", public_provider_routes_default);
router10.use("/upload", upload_routes_default);
var routes_default = router10;

// src/app.ts
import { fileURLToPath } from "url";
import path2 from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var ALLOWED_ORIGINS = [
  config.frontendUrl,
  "https://foodhub-frontend-sand.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000"
].filter(Boolean);
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin && ALLOWED_ORIGINS[0]) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGINS[0]);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});
var corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, ALLOWED_ORIGINS[0] ?? false);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, origin);
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
app.get("/health", (_req, res) => {
  res.status(200).json(healthPayload());
});
app.get("/api/health", (_req, res) => {
  res.status(200).json(healthPayload());
});
app.all("/api/auth/*path", toNodeHandler(auth));
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
    const required = ["DATABASE_URL", "BETTER_AUTH_SECRET"];
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
