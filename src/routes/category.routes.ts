import { Router, IRouter } from "express";
import * as categoryController from "../controllers/category.controller";
import { validateQuery, validateParams } from "../middlewares";
import { categoryQuerySchema, categoryIdParamSchema } from "../validations/category.validation";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// PUBLIC CATEGORY ROUTES
// /api/categories/*
// ═══════════════════════════════════════════════════════════

// Get all categories (Public)
router.get(
    "/",
    validateQuery(categoryQuerySchema),
    categoryController.getCategories
);

// Get category by ID (Public)
router.get(
    "/:id",
    validateParams(categoryIdParamSchema),
    categoryController.getCategoryById
);

export default router;
