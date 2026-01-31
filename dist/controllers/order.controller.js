import * as orderService from "../services/order.service";
import * as providerService from "../services/provider.service";
import { sendSuccess, sendCreated } from "../utils/response.util";
// Import types
import "../types";
// ═══════════════════════════════════════════════════════════
// ORDER CONTROLLER
// Handles HTTP requests for order management
// ═══════════════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────
// PROVIDER ORDER ENDPOINTS
// ─────────────────────────────────────────────────────────────
/**
 * GET /api/provider/orders
 * Get provider's orders
 */
export const getProviderOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await providerService.getProfileByUserId(userId);
        const query = res.locals["validatedQuery"] || req.query;
        const result = await orderService.getProviderOrders(profile.id, query);
        sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/provider/orders/:id
 * Get specific order details for provider
 */
export const getProviderOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderId = req.params["id"];
        const profile = await providerService.getProfileByUserId(userId);
        const order = await orderService.getProviderOrderById(orderId, profile.id);
        sendSuccess(res, order, "Order fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * PATCH /api/provider/orders/:id/status
 * Update order status
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderId = req.params["id"];
        const profile = await providerService.getProfileByUserId(userId);
        const order = await orderService.updateOrderStatus(orderId, profile.id, req.body);
        sendSuccess(res, order, "Order status updated successfully");
    }
    catch (error) {
        next(error);
    }
};
// ─────────────────────────────────────────────────────────────
// CUSTOMER ORDER ENDPOINTS
// ─────────────────────────────────────────────────────────────
/**
 * POST /api/orders
 * Create a new order (Customer)
 */
export const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const order = await orderService.createOrder(userId, req.body);
        sendCreated(res, order, "Order placed successfully");
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/orders
 * Get customer's orders
 */
export const getCustomerOrders = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const query = res.locals["validatedQuery"] || req.query;
        const result = await orderService.getCustomerOrders(userId, query);
        sendSuccess(res, result.orders, "Orders fetched successfully", 200, result.meta);
    }
    catch (error) {
        next(error);
    }
};
/**
 * GET /api/orders/:id
 * Get specific order details for customer
 */
export const getCustomerOrderById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const orderId = req.params["id"];
        const order = await orderService.getCustomerOrderById(orderId, userId);
        sendSuccess(res, order, "Order fetched successfully");
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=order.controller.js.map