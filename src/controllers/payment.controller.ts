import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { sslcommerz } from "../lib/sslcommerz";
import { config } from "../config";

export const initPayment = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;
        // @ts-ignore
        const userId = req.user.id;

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { customer: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.customerId !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        if (order.paymentStatus !== "PENDING") {
            return res.status(400).json({ success: false, message: "Order is not pending payment" });
        }

        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        await prisma.order.update({
            where: { id: orderId },
            data: { transactionId }
        });

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const data = {
            total_amount: order.totalAmount,
            currency: 'BDT',
            tran_id: transactionId, 
            success_url: `${baseUrl}/api/payment/success/${transactionId}`,
            fail_url: `${baseUrl}/api/payment/fail/${transactionId}`,
            cancel_url: `${baseUrl}/api/payment/cancel/${transactionId}`,
            ipn_url: `${baseUrl}/api/payment/ipn`,
            shipping_method: 'Courier',
            product_name: 'Food Order',
            product_category: 'Food',
            product_profile: 'general',
            cus_name: order.customer.name || 'Customer',
            cus_email: order.customer.email,
            cus_add1: order.deliveryAddress,
            cus_add2: order.deliveryAddress,
            cus_city: 'Dhaka',
            cus_state: 'Dhaka',
            cus_postcode: '1000',
            cus_country: 'Bangladesh',
            cus_phone: order.customer.phone || '01711111111',
            cus_fax: '01711111111',
            ship_name: order.customer.name || 'Customer',
            ship_add1: order.deliveryAddress,
            ship_add2: order.deliveryAddress,
            ship_city: 'Dhaka',
            ship_state: 'Dhaka',
            ship_postcode: 1000,
            ship_country: 'Bangladesh',
        };

        sslcommerz.init(data).then((apiResponse: any) => {
            // Redirect the user to payment gateway
            let GatewayPageURL = apiResponse.GatewayPageURL;
            if (GatewayPageURL) {
                return res.status(200).json({ success: true, url: GatewayPageURL });
            } else {
                return res.status(400).json({ success: false, message: "Failed to initialize payment gateway" });
            }
        }).catch((error: any) => {
            console.error("SSLCommerz init error:", error);
            return res.status(500).json({ success: false, message: "Failed to initialize payment gateway" });
        });
    } catch (error) {
        console.error("Payment init error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const paymentSuccess = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.params;
        
        const order = await prisma.order.update({
            where: { transactionId: tran_id },
            data: { 
                paymentStatus: "SUCCESS",
                status: "PLACED" 
            }
        });

        res.redirect(`${config.frontendUrl}/checkout/success?orderId=${order.id}`);
    } catch (error) {
        console.error("Payment success error:", error);
        res.redirect(`${config.frontendUrl}/checkout/fail`);
    }
};

export const paymentFail = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.params;

        await prisma.order.update({
            where: { transactionId: tran_id },
            data: { paymentStatus: "FAILED" }
        });

        res.redirect(`${config.frontendUrl}/checkout/fail`);
    } catch (error) {
        console.error("Payment fail error:", error);
        res.redirect(`${config.frontendUrl}/checkout/fail`);
    }
};

export const paymentCancel = async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.params;

        await prisma.order.update({
            where: { transactionId: tran_id },
            data: { paymentStatus: "CANCELLED" }
        });

        res.redirect(`${config.frontendUrl}/checkout/cancel`);
    } catch (error) {
        console.error("Payment cancel error:", error);
        res.redirect(`${config.frontendUrl}/checkout/cancel`);
    }
};

export const paymentIpn = async (req: Request, res: Response) => {
    try {
        // IPN logic (optional)
        const { status, tran_id } = req.body;
        
        if (status === 'VALID' && tran_id) {
            await prisma.order.update({
                where: { transactionId: tran_id },
                data: { paymentStatus: "SUCCESS" }
            });
        }
        
        return res.status(200).json({ message: "IPN received" });
    } catch (error) {
        console.error("IPN error:", error);
        return res.status(500).json({ message: "IPN processing error" });
    }
};
