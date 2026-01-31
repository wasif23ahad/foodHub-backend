export declare const Role: {
    readonly CUSTOMER: "CUSTOMER";
    readonly PROVIDER: "PROVIDER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const OrderStatus: {
    readonly PLACED: "PLACED";
    readonly PREPARING: "PREPARING";
    readonly READY: "READY";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
};
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
//# sourceMappingURL=enums.d.ts.map