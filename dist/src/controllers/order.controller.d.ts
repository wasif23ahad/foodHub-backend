import { Request, Response, NextFunction } from "express";
import "../types";
/**
 * GET /api/provider/orders
 * Get provider's orders
 */
export declare const getProviderOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/provider/orders/:id
 * Get specific order details for provider
 */
export declare const getProviderOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PATCH /api/provider/orders/:id/status
 * Update order status
 */
export declare const updateOrderStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * POST /api/orders
 * Create a new order (Customer)
 */
export declare const createOrder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/orders
 * Get customer's orders
 */
export declare const getCustomerOrders: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * GET /api/orders/:id
 * Get specific order details for customer
 */
export declare const getCustomerOrderById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map