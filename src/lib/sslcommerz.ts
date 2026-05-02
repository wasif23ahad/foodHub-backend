// @ts-ignore
import SSLCommerzPayment from "sslcommerz-lts";
import { config } from "../config";

export const sslcommerz = new SSLCommerzPayment(
    config.sslcommerzStoreId, 
    config.sslcommerzStorePassword, 
    config.sslcommerzIsLive
);
