import { Router, IRouter } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAuth, requireCustomer, validateBody, validateQuery, validateParams } from "../middlewares";
import {
    createOrderSchema,
    orderQuerySchema,
    orderIdParamSchema,
} from "../validations/order.validation";
import { createOrderReviewSchema } from "../validations/review.validation";
import * as reviewController from "../controllers/review.controller";

const router: IRouter = Router();

router.post(
    "/",
    requireAuth,
    requireCustomer,
    validateBody(createOrderSchema),
    orderController.createOrder
);

router.get(
    "/",
    requireAuth,
    requireCustomer,
    validateQuery(orderQuerySchema),
    orderController.getCustomerOrders
);

router.get(
    "/:id",
    requireAuth,
    requireCustomer,
    validateParams(orderIdParamSchema),
    orderController.getCustomerOrderById
);

router.patch(
    "/:id/cancel",
    requireAuth,
    requireCustomer,
    validateParams(orderIdParamSchema),
    orderController.cancelOrder
);

router.post(
    "/:id/reviews",
    requireAuth,
    requireCustomer,
    validateParams(orderIdParamSchema),
    validateBody(createOrderReviewSchema),
    reviewController.createOrderReview
);

export default router;
