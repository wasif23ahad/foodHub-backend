import { Router, IRouter } from "express";
import * as orderController from "../controllers/order.controller";
import { requireAuth, validateBody, validateQuery, validateParams } from "../middlewares";
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
    validateBody(createOrderSchema),
    orderController.createOrder
);

router.get(
    "/",
    requireAuth,
    validateQuery(orderQuerySchema),
    orderController.getCustomerOrders
);

router.get(
    "/:id",
    requireAuth,
    validateParams(orderIdParamSchema),
    orderController.getCustomerOrderById
);

router.patch(
    "/:id/cancel",
    requireAuth,
    validateParams(orderIdParamSchema),
    orderController.cancelOrder
);

router.post(
    "/:id/reviews",
    requireAuth,
    validateParams(orderIdParamSchema),
    validateBody(createOrderReviewSchema),
    reviewController.createOrderReview
);

export default router;
