import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * POST /api/provider/meals
 * Create a new meal (Provider only)
 */
export declare const createMeal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/meals
 * Get all meals with filters (Public)
 */
export declare const getMeals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/meals/:id
 * Get meal by ID (Public)
 */
export declare const getMealById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/provider/meals/:id
 * Update meal (Provider only)
 */
export declare const updateMeal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * DELETE /api/provider/meals/:id
 * Delete meal (Provider only)
 */
export declare const deleteMeal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/provider/meals
 * Get provider's own meals (Provider only)
 */
export declare const getMyMeals: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=meal.controller.d.ts.map