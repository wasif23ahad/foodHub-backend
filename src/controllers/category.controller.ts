import { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.service";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.util";

// Import types
import "../types";

// ═══════════════════════════════════════════════════════════
// CATEGORY CONTROLLER
// Handles HTTP requests for category management
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/categories
 * Get all categories (Public)
 */
export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const query = res.locals["validatedQuery"] || req.query;
        const result = await categoryService.getCategories(query);
        sendSuccess(res, result.categories, "Categories fetched successfully", 200, result.meta);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/categories/:id
 * Get category by ID (Public)
 */
export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = req.params["id"] as string;
        const category = await categoryService.getCategoryById(categoryId);
        sendSuccess(res, category, "Category fetched successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/categories
 * Create a new category (Admin only)
 */
export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const category = await categoryService.createCategory(req.body);
        sendCreated(res, category, "Category created successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/categories/:id
 * Update a category (Admin only)
 */
export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = req.params["id"] as string;
        const category = await categoryService.updateCategory(categoryId, req.body);
        sendSuccess(res, category, "Category updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/categories/:id
 * Delete a category (Admin only)
 */
export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const categoryId = req.params["id"] as string;
        await categoryService.deleteCategory(categoryId);
        sendNoContent(res);
    } catch (error) {
        next(error);
    }
};
