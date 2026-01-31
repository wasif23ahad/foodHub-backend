import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * GET /api/categories
 * Get all categories (Public)
 */
export declare const getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/categories/:id
 * Get category by ID (Public)
 */
export declare const getCategoryById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * POST /api/admin/categories
 * Create a new category (Admin only)
 */
export declare const createCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/admin/categories/:id
 * Update a category (Admin only)
 */
export declare const updateCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * DELETE /api/admin/categories/:id
 * Delete a category (Admin only)
 */
export declare const deleteCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map