import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { initPayment, paymentSuccess, paymentFail, paymentCancel, paymentIpn } from "../controllers/payment.controller";

const router = Router();

router.post("/init", authMiddleware, initPayment);

// SSLCommerz sends POST requests for these callbacks, no auth middleware since it's from SSLCommerz server
router.post("/success/:tran_id", paymentSuccess);
router.post("/fail/:tran_id", paymentFail);
router.post("/cancel/:tran_id", paymentCancel);
router.post("/ipn", paymentIpn);

export default router;
