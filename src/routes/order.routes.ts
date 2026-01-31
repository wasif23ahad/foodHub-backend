import { Router, IRouter } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAuth, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    createOrderSchema,
    orderQuerySchema,
    orderIdParamSchema,
} from "../validations/order.validation";

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════════
// CUSTOMER ORDER ROUTES
// /api/orders/*
// ═══════════════════════════════════════════════════════════

// Create a new order (any authenticated user can order)
router.post(
    "/",
    requireAuth,
    validateBody(createOrderSchema),
    orderController.createOrder
);

// Get customer's orders
router.get(
    "/",
    requireAuth,
    validateQuery(orderQuerySchema),
    orderController.getCustomerOrders
);

// Get specific order details
router.get(
    "/:id",
    requireAuth,
    validateParams(orderIdParamSchema),
    orderController.getCustomerOrderById
);

export default router;
