import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model order
 *
 */
export type orderModel = runtime.Types.Result.DefaultSelection<Prisma.$orderPayload>;
export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null;
    _avg: OrderAvgAggregateOutputType | null;
    _sum: OrderSumAggregateOutputType | null;
    _min: OrderMinAggregateOutputType | null;
    _max: OrderMaxAggregateOutputType | null;
};
export type OrderAvgAggregateOutputType = {
    totalAmount: number | null;
};
export type OrderSumAggregateOutputType = {
    totalAmount: number | null;
};
export type OrderMinAggregateOutputType = {
    id: string | null;
    customerId: string | null;
    providerProfileId: string | null;
    status: $Enums.OrderStatus | null;
    deliveryAddress: string | null;
    deliveryNotes: string | null;
    totalAmount: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OrderMaxAggregateOutputType = {
    id: string | null;
    customerId: string | null;
    providerProfileId: string | null;
    status: $Enums.OrderStatus | null;
    deliveryAddress: string | null;
    deliveryNotes: string | null;
    totalAmount: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type OrderCountAggregateOutputType = {
    id: number;
    customerId: number;
    providerProfileId: number;
    status: number;
    deliveryAddress: number;
    deliveryNotes: number;
    totalAmount: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type OrderAvgAggregateInputType = {
    totalAmount?: true;
};
export type OrderSumAggregateInputType = {
    totalAmount?: true;
};
export type OrderMinAggregateInputType = {
    id?: true;
    customerId?: true;
    providerProfileId?: true;
    status?: true;
    deliveryAddress?: true;
    deliveryNotes?: true;
    totalAmount?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OrderMaxAggregateInputType = {
    id?: true;
    customerId?: true;
    providerProfileId?: true;
    status?: true;
    deliveryAddress?: true;
    deliveryNotes?: true;
    totalAmount?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type OrderCountAggregateInputType = {
    id?: true;
    customerId?: true;
    providerProfileId?: true;
    status?: true;
    deliveryAddress?: true;
    deliveryNotes?: true;
    totalAmount?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type OrderAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which order to aggregate.
     */
    where?: Prisma.orderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of orders to fetch.
     */
    orderBy?: Prisma.orderOrderByWithRelationInput | Prisma.orderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.orderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned orders
    **/
    _count?: true | OrderCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType;
};
export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
    [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateOrder[P]> : Prisma.GetScalarType<T[P], AggregateOrder[P]>;
};
export type orderGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.orderWhereInput;
    orderBy?: Prisma.orderOrderByWithAggregationInput | Prisma.orderOrderByWithAggregationInput[];
    by: Prisma.OrderScalarFieldEnum[] | Prisma.OrderScalarFieldEnum;
    having?: Prisma.orderScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: OrderCountAggregateInputType | true;
    _avg?: OrderAvgAggregateInputType;
    _sum?: OrderSumAggregateInputType;
    _min?: OrderMinAggregateInputType;
    _max?: OrderMaxAggregateInputType;
};
export type OrderGroupByOutputType = {
    id: string;
    customerId: string;
    providerProfileId: string;
    status: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes: string | null;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
    _count: OrderCountAggregateOutputType | null;
    _avg: OrderAvgAggregateOutputType | null;
    _sum: OrderSumAggregateOutputType | null;
    _min: OrderMinAggregateOutputType | null;
    _max: OrderMaxAggregateOutputType | null;
};
type GetOrderGroupByPayload<T extends orderGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<OrderGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], OrderGroupByOutputType[P]> : Prisma.GetScalarType<T[P], OrderGroupByOutputType[P]>;
}>>;
export type orderWhereInput = {
    AND?: Prisma.orderWhereInput | Prisma.orderWhereInput[];
    OR?: Prisma.orderWhereInput[];
    NOT?: Prisma.orderWhereInput | Prisma.orderWhereInput[];
    id?: Prisma.StringFilter<"order"> | string;
    customerId?: Prisma.StringFilter<"order"> | string;
    providerProfileId?: Prisma.StringFilter<"order"> | string;
    status?: Prisma.EnumOrderStatusFilter<"order"> | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFilter<"order"> | string;
    deliveryNotes?: Prisma.StringNullableFilter<"order"> | string | null;
    totalAmount?: Prisma.FloatFilter<"order"> | number;
    createdAt?: Prisma.DateTimeFilter<"order"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"order"> | Date | string;
    customer?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.userWhereInput>;
    providerProfile?: Prisma.XOR<Prisma.ProviderProfileScalarRelationFilter, Prisma.providerProfileWhereInput>;
    orderItems?: Prisma.OrderItemListRelationFilter;
};
export type orderOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    providerProfileId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    deliveryAddress?: Prisma.SortOrder;
    deliveryNotes?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalAmount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    customer?: Prisma.userOrderByWithRelationInput;
    providerProfile?: Prisma.providerProfileOrderByWithRelationInput;
    orderItems?: Prisma.orderItemOrderByRelationAggregateInput;
};
export type orderWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.orderWhereInput | Prisma.orderWhereInput[];
    OR?: Prisma.orderWhereInput[];
    NOT?: Prisma.orderWhereInput | Prisma.orderWhereInput[];
    customerId?: Prisma.StringFilter<"order"> | string;
    providerProfileId?: Prisma.StringFilter<"order"> | string;
    status?: Prisma.EnumOrderStatusFilter<"order"> | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFilter<"order"> | string;
    deliveryNotes?: Prisma.StringNullableFilter<"order"> | string | null;
    totalAmount?: Prisma.FloatFilter<"order"> | number;
    createdAt?: Prisma.DateTimeFilter<"order"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"order"> | Date | string;
    customer?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.userWhereInput>;
    providerProfile?: Prisma.XOR<Prisma.ProviderProfileScalarRelationFilter, Prisma.providerProfileWhereInput>;
    orderItems?: Prisma.OrderItemListRelationFilter;
}, "id">;
export type orderOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    providerProfileId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    deliveryAddress?: Prisma.SortOrder;
    deliveryNotes?: Prisma.SortOrderInput | Prisma.SortOrder;
    totalAmount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.orderCountOrderByAggregateInput;
    _avg?: Prisma.orderAvgOrderByAggregateInput;
    _max?: Prisma.orderMaxOrderByAggregateInput;
    _min?: Prisma.orderMinOrderByAggregateInput;
    _sum?: Prisma.orderSumOrderByAggregateInput;
};
export type orderScalarWhereWithAggregatesInput = {
    AND?: Prisma.orderScalarWhereWithAggregatesInput | Prisma.orderScalarWhereWithAggregatesInput[];
    OR?: Prisma.orderScalarWhereWithAggregatesInput[];
    NOT?: Prisma.orderScalarWhereWithAggregatesInput | Prisma.orderScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"order"> | string;
    customerId?: Prisma.StringWithAggregatesFilter<"order"> | string;
    providerProfileId?: Prisma.StringWithAggregatesFilter<"order"> | string;
    status?: Prisma.EnumOrderStatusWithAggregatesFilter<"order"> | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringWithAggregatesFilter<"order"> | string;
    deliveryNotes?: Prisma.StringNullableWithAggregatesFilter<"order"> | string | null;
    totalAmount?: Prisma.FloatWithAggregatesFilter<"order"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"order"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"order"> | Date | string;
};
export type orderCreateInput = {
    id?: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer: Prisma.userCreateNestedOneWithoutOrdersInput;
    providerProfile: Prisma.providerProfileCreateNestedOneWithoutOrdersInput;
    orderItems?: Prisma.orderItemCreateNestedManyWithoutOrderInput;
};
export type orderUncheckedCreateInput = {
    id?: string;
    customerId: string;
    providerProfileId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    orderItems?: Prisma.orderItemUncheckedCreateNestedManyWithoutOrderInput;
};
export type orderUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.userUpdateOneRequiredWithoutOrdersNestedInput;
    providerProfile?: Prisma.providerProfileUpdateOneRequiredWithoutOrdersNestedInput;
    orderItems?: Prisma.orderItemUpdateManyWithoutOrderNestedInput;
};
export type orderUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    providerProfileId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    orderItems?: Prisma.orderItemUncheckedUpdateManyWithoutOrderNestedInput;
};
export type orderCreateManyInput = {
    id?: string;
    customerId: string;
    providerProfileId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type orderUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type orderUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    providerProfileId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type OrderListRelationFilter = {
    every?: Prisma.orderWhereInput;
    some?: Prisma.orderWhereInput;
    none?: Prisma.orderWhereInput;
};
export type orderOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type orderCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    providerProfileId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    deliveryAddress?: Prisma.SortOrder;
    deliveryNotes?: Prisma.SortOrder;
    totalAmount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type orderAvgOrderByAggregateInput = {
    totalAmount?: Prisma.SortOrder;
};
export type orderMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    providerProfileId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    deliveryAddress?: Prisma.SortOrder;
    deliveryNotes?: Prisma.SortOrder;
    totalAmount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type orderMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    providerProfileId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    deliveryAddress?: Prisma.SortOrder;
    deliveryNotes?: Prisma.SortOrder;
    totalAmount?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type orderSumOrderByAggregateInput = {
    totalAmount?: Prisma.SortOrder;
};
export type OrderScalarRelationFilter = {
    is?: Prisma.orderWhereInput;
    isNot?: Prisma.orderWhereInput;
};
export type orderCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput> | Prisma.orderCreateWithoutCustomerInput[] | Prisma.orderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutCustomerInput | Prisma.orderCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.orderCreateManyCustomerInputEnvelope;
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
};
export type orderUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput> | Prisma.orderCreateWithoutCustomerInput[] | Prisma.orderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutCustomerInput | Prisma.orderCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.orderCreateManyCustomerInputEnvelope;
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
};
export type orderUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput> | Prisma.orderCreateWithoutCustomerInput[] | Prisma.orderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutCustomerInput | Prisma.orderCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.orderUpsertWithWhereUniqueWithoutCustomerInput | Prisma.orderUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.orderCreateManyCustomerInputEnvelope;
    set?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    disconnect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    delete?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    update?: Prisma.orderUpdateWithWhereUniqueWithoutCustomerInput | Prisma.orderUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.orderUpdateManyWithWhereWithoutCustomerInput | Prisma.orderUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
};
export type orderUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput> | Prisma.orderCreateWithoutCustomerInput[] | Prisma.orderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutCustomerInput | Prisma.orderCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.orderUpsertWithWhereUniqueWithoutCustomerInput | Prisma.orderUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.orderCreateManyCustomerInputEnvelope;
    set?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    disconnect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    delete?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    update?: Prisma.orderUpdateWithWhereUniqueWithoutCustomerInput | Prisma.orderUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.orderUpdateManyWithWhereWithoutCustomerInput | Prisma.orderUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
};
export type orderCreateNestedManyWithoutProviderProfileInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput> | Prisma.orderCreateWithoutProviderProfileInput[] | Prisma.orderUncheckedCreateWithoutProviderProfileInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutProviderProfileInput | Prisma.orderCreateOrConnectWithoutProviderProfileInput[];
    createMany?: Prisma.orderCreateManyProviderProfileInputEnvelope;
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
};
export type orderUncheckedCreateNestedManyWithoutProviderProfileInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput> | Prisma.orderCreateWithoutProviderProfileInput[] | Prisma.orderUncheckedCreateWithoutProviderProfileInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutProviderProfileInput | Prisma.orderCreateOrConnectWithoutProviderProfileInput[];
    createMany?: Prisma.orderCreateManyProviderProfileInputEnvelope;
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
};
export type orderUpdateManyWithoutProviderProfileNestedInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput> | Prisma.orderCreateWithoutProviderProfileInput[] | Prisma.orderUncheckedCreateWithoutProviderProfileInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutProviderProfileInput | Prisma.orderCreateOrConnectWithoutProviderProfileInput[];
    upsert?: Prisma.orderUpsertWithWhereUniqueWithoutProviderProfileInput | Prisma.orderUpsertWithWhereUniqueWithoutProviderProfileInput[];
    createMany?: Prisma.orderCreateManyProviderProfileInputEnvelope;
    set?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    disconnect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    delete?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    update?: Prisma.orderUpdateWithWhereUniqueWithoutProviderProfileInput | Prisma.orderUpdateWithWhereUniqueWithoutProviderProfileInput[];
    updateMany?: Prisma.orderUpdateManyWithWhereWithoutProviderProfileInput | Prisma.orderUpdateManyWithWhereWithoutProviderProfileInput[];
    deleteMany?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
};
export type orderUncheckedUpdateManyWithoutProviderProfileNestedInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput> | Prisma.orderCreateWithoutProviderProfileInput[] | Prisma.orderUncheckedCreateWithoutProviderProfileInput[];
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutProviderProfileInput | Prisma.orderCreateOrConnectWithoutProviderProfileInput[];
    upsert?: Prisma.orderUpsertWithWhereUniqueWithoutProviderProfileInput | Prisma.orderUpsertWithWhereUniqueWithoutProviderProfileInput[];
    createMany?: Prisma.orderCreateManyProviderProfileInputEnvelope;
    set?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    disconnect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    delete?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    connect?: Prisma.orderWhereUniqueInput | Prisma.orderWhereUniqueInput[];
    update?: Prisma.orderUpdateWithWhereUniqueWithoutProviderProfileInput | Prisma.orderUpdateWithWhereUniqueWithoutProviderProfileInput[];
    updateMany?: Prisma.orderUpdateManyWithWhereWithoutProviderProfileInput | Prisma.orderUpdateManyWithWhereWithoutProviderProfileInput[];
    deleteMany?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
};
export type EnumOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderStatus;
};
export type orderCreateNestedOneWithoutOrderItemsInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutOrderItemsInput, Prisma.orderUncheckedCreateWithoutOrderItemsInput>;
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutOrderItemsInput;
    connect?: Prisma.orderWhereUniqueInput;
};
export type orderUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: Prisma.XOR<Prisma.orderCreateWithoutOrderItemsInput, Prisma.orderUncheckedCreateWithoutOrderItemsInput>;
    connectOrCreate?: Prisma.orderCreateOrConnectWithoutOrderItemsInput;
    upsert?: Prisma.orderUpsertWithoutOrderItemsInput;
    connect?: Prisma.orderWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.orderUpdateToOneWithWhereWithoutOrderItemsInput, Prisma.orderUpdateWithoutOrderItemsInput>, Prisma.orderUncheckedUpdateWithoutOrderItemsInput>;
};
export type orderCreateWithoutCustomerInput = {
    id?: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    providerProfile: Prisma.providerProfileCreateNestedOneWithoutOrdersInput;
    orderItems?: Prisma.orderItemCreateNestedManyWithoutOrderInput;
};
export type orderUncheckedCreateWithoutCustomerInput = {
    id?: string;
    providerProfileId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    orderItems?: Prisma.orderItemUncheckedCreateNestedManyWithoutOrderInput;
};
export type orderCreateOrConnectWithoutCustomerInput = {
    where: Prisma.orderWhereUniqueInput;
    create: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput>;
};
export type orderCreateManyCustomerInputEnvelope = {
    data: Prisma.orderCreateManyCustomerInput | Prisma.orderCreateManyCustomerInput[];
    skipDuplicates?: boolean;
};
export type orderUpsertWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.orderWhereUniqueInput;
    update: Prisma.XOR<Prisma.orderUpdateWithoutCustomerInput, Prisma.orderUncheckedUpdateWithoutCustomerInput>;
    create: Prisma.XOR<Prisma.orderCreateWithoutCustomerInput, Prisma.orderUncheckedCreateWithoutCustomerInput>;
};
export type orderUpdateWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.orderWhereUniqueInput;
    data: Prisma.XOR<Prisma.orderUpdateWithoutCustomerInput, Prisma.orderUncheckedUpdateWithoutCustomerInput>;
};
export type orderUpdateManyWithWhereWithoutCustomerInput = {
    where: Prisma.orderScalarWhereInput;
    data: Prisma.XOR<Prisma.orderUpdateManyMutationInput, Prisma.orderUncheckedUpdateManyWithoutCustomerInput>;
};
export type orderScalarWhereInput = {
    AND?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
    OR?: Prisma.orderScalarWhereInput[];
    NOT?: Prisma.orderScalarWhereInput | Prisma.orderScalarWhereInput[];
    id?: Prisma.StringFilter<"order"> | string;
    customerId?: Prisma.StringFilter<"order"> | string;
    providerProfileId?: Prisma.StringFilter<"order"> | string;
    status?: Prisma.EnumOrderStatusFilter<"order"> | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFilter<"order"> | string;
    deliveryNotes?: Prisma.StringNullableFilter<"order"> | string | null;
    totalAmount?: Prisma.FloatFilter<"order"> | number;
    createdAt?: Prisma.DateTimeFilter<"order"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"order"> | Date | string;
};
export type orderCreateWithoutProviderProfileInput = {
    id?: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer: Prisma.userCreateNestedOneWithoutOrdersInput;
    orderItems?: Prisma.orderItemCreateNestedManyWithoutOrderInput;
};
export type orderUncheckedCreateWithoutProviderProfileInput = {
    id?: string;
    customerId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    orderItems?: Prisma.orderItemUncheckedCreateNestedManyWithoutOrderInput;
};
export type orderCreateOrConnectWithoutProviderProfileInput = {
    where: Prisma.orderWhereUniqueInput;
    create: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput>;
};
export type orderCreateManyProviderProfileInputEnvelope = {
    data: Prisma.orderCreateManyProviderProfileInput | Prisma.orderCreateManyProviderProfileInput[];
    skipDuplicates?: boolean;
};
export type orderUpsertWithWhereUniqueWithoutProviderProfileInput = {
    where: Prisma.orderWhereUniqueInput;
    update: Prisma.XOR<Prisma.orderUpdateWithoutProviderProfileInput, Prisma.orderUncheckedUpdateWithoutProviderProfileInput>;
    create: Prisma.XOR<Prisma.orderCreateWithoutProviderProfileInput, Prisma.orderUncheckedCreateWithoutProviderProfileInput>;
};
export type orderUpdateWithWhereUniqueWithoutProviderProfileInput = {
    where: Prisma.orderWhereUniqueInput;
    data: Prisma.XOR<Prisma.orderUpdateWithoutProviderProfileInput, Prisma.orderUncheckedUpdateWithoutProviderProfileInput>;
};
export type orderUpdateManyWithWhereWithoutProviderProfileInput = {
    where: Prisma.orderScalarWhereInput;
    data: Prisma.XOR<Prisma.orderUpdateManyMutationInput, Prisma.orderUncheckedUpdateManyWithoutProviderProfileInput>;
};
export type orderCreateWithoutOrderItemsInput = {
    id?: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer: Prisma.userCreateNestedOneWithoutOrdersInput;
    providerProfile: Prisma.providerProfileCreateNestedOneWithoutOrdersInput;
};
export type orderUncheckedCreateWithoutOrderItemsInput = {
    id?: string;
    customerId: string;
    providerProfileId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type orderCreateOrConnectWithoutOrderItemsInput = {
    where: Prisma.orderWhereUniqueInput;
    create: Prisma.XOR<Prisma.orderCreateWithoutOrderItemsInput, Prisma.orderUncheckedCreateWithoutOrderItemsInput>;
};
export type orderUpsertWithoutOrderItemsInput = {
    update: Prisma.XOR<Prisma.orderUpdateWithoutOrderItemsInput, Prisma.orderUncheckedUpdateWithoutOrderItemsInput>;
    create: Prisma.XOR<Prisma.orderCreateWithoutOrderItemsInput, Prisma.orderUncheckedCreateWithoutOrderItemsInput>;
    where?: Prisma.orderWhereInput;
};
export type orderUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: Prisma.orderWhereInput;
    data: Prisma.XOR<Prisma.orderUpdateWithoutOrderItemsInput, Prisma.orderUncheckedUpdateWithoutOrderItemsInput>;
};
export type orderUpdateWithoutOrderItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.userUpdateOneRequiredWithoutOrdersNestedInput;
    providerProfile?: Prisma.providerProfileUpdateOneRequiredWithoutOrdersNestedInput;
};
export type orderUncheckedUpdateWithoutOrderItemsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    providerProfileId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type orderCreateManyCustomerInput = {
    id?: string;
    providerProfileId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type orderUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    providerProfile?: Prisma.providerProfileUpdateOneRequiredWithoutOrdersNestedInput;
    orderItems?: Prisma.orderItemUpdateManyWithoutOrderNestedInput;
};
export type orderUncheckedUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    providerProfileId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    orderItems?: Prisma.orderItemUncheckedUpdateManyWithoutOrderNestedInput;
};
export type orderUncheckedUpdateManyWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    providerProfileId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type orderCreateManyProviderProfileInput = {
    id?: string;
    customerId: string;
    status?: $Enums.OrderStatus;
    deliveryAddress: string;
    deliveryNotes?: string | null;
    totalAmount: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type orderUpdateWithoutProviderProfileInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.userUpdateOneRequiredWithoutOrdersNestedInput;
    orderItems?: Prisma.orderItemUpdateManyWithoutOrderNestedInput;
};
export type orderUncheckedUpdateWithoutProviderProfileInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    orderItems?: Prisma.orderItemUncheckedUpdateManyWithoutOrderNestedInput;
};
export type orderUncheckedUpdateManyWithoutProviderProfileInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumOrderStatusFieldUpdateOperationsInput | $Enums.OrderStatus;
    deliveryAddress?: Prisma.StringFieldUpdateOperationsInput | string;
    deliveryNotes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    totalAmount?: Prisma.FloatFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type OrderCountOutputType
 */
export type OrderCountOutputType = {
    orderItems: number;
};
export type OrderCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    orderItems?: boolean | OrderCountOutputTypeCountOrderItemsArgs;
};
/**
 * OrderCountOutputType without action
 */
export type OrderCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: Prisma.OrderCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * OrderCountOutputType without action
 */
export type OrderCountOutputTypeCountOrderItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.orderItemWhereInput;
};
export type orderSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    customerId?: boolean;
    providerProfileId?: boolean;
    status?: boolean;
    deliveryAddress?: boolean;
    deliveryNotes?: boolean;
    totalAmount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
    orderItems?: boolean | Prisma.order$orderItemsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrderCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["order"]>;
export type orderSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    customerId?: boolean;
    providerProfileId?: boolean;
    status?: boolean;
    deliveryAddress?: boolean;
    deliveryNotes?: boolean;
    totalAmount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["order"]>;
export type orderSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    customerId?: boolean;
    providerProfileId?: boolean;
    status?: boolean;
    deliveryAddress?: boolean;
    deliveryNotes?: boolean;
    totalAmount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["order"]>;
export type orderSelectScalar = {
    id?: boolean;
    customerId?: boolean;
    providerProfileId?: boolean;
    status?: boolean;
    deliveryAddress?: boolean;
    deliveryNotes?: boolean;
    totalAmount?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type orderOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "customerId" | "providerProfileId" | "status" | "deliveryAddress" | "deliveryNotes" | "totalAmount" | "createdAt" | "updatedAt", ExtArgs["result"]["order"]>;
export type orderInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
    orderItems?: boolean | Prisma.order$orderItemsArgs<ExtArgs>;
    _count?: boolean | Prisma.OrderCountOutputTypeDefaultArgs<ExtArgs>;
};
export type orderIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
};
export type orderIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    customer?: boolean | Prisma.userDefaultArgs<ExtArgs>;
    providerProfile?: boolean | Prisma.providerProfileDefaultArgs<ExtArgs>;
};
export type $orderPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "order";
    objects: {
        customer: Prisma.$userPayload<ExtArgs>;
        providerProfile: Prisma.$providerProfilePayload<ExtArgs>;
        orderItems: Prisma.$orderItemPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        customerId: string;
        providerProfileId: string;
        status: $Enums.OrderStatus;
        deliveryAddress: string;
        deliveryNotes: string | null;
        totalAmount: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["order"]>;
    composites: {};
};
export type orderGetPayload<S extends boolean | null | undefined | orderDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$orderPayload, S>;
export type orderCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<orderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: OrderCountAggregateInputType | true;
};
export interface orderDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['order'];
        meta: {
            name: 'order';
        };
    };
    /**
     * Find zero or one Order that matches the filter.
     * @param {orderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends orderFindUniqueArgs>(args: Prisma.SelectSubset<T, orderFindUniqueArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {orderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends orderFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, orderFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends orderFindFirstArgs>(args?: Prisma.SelectSubset<T, orderFindFirstArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends orderFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, orderFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     *
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     *
     */
    findMany<T extends orderFindManyArgs>(args?: Prisma.SelectSubset<T, orderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Order.
     * @param {orderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     *
     */
    create<T extends orderCreateArgs>(args: Prisma.SelectSubset<T, orderCreateArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Orders.
     * @param {orderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends orderCreateManyArgs>(args?: Prisma.SelectSubset<T, orderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Orders and returns the data saved in the database.
     * @param {orderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends orderCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, orderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Order.
     * @param {orderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     *
     */
    delete<T extends orderDeleteArgs>(args: Prisma.SelectSubset<T, orderDeleteArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Order.
     * @param {orderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends orderUpdateArgs>(args: Prisma.SelectSubset<T, orderUpdateArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Orders.
     * @param {orderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends orderDeleteManyArgs>(args?: Prisma.SelectSubset<T, orderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends orderUpdateManyArgs>(args: Prisma.SelectSubset<T, orderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {orderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends orderUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, orderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Order.
     * @param {orderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends orderUpsertArgs>(args: Prisma.SelectSubset<T, orderUpsertArgs<ExtArgs>>): Prisma.Prisma__orderClient<runtime.Types.Result.GetResult<Prisma.$orderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends orderCountArgs>(args?: Prisma.Subset<T, orderCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], OrderCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Prisma.Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>;
    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {orderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends orderGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: orderGroupByArgs['orderBy'];
    } : {
        orderBy?: orderGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, orderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the order model
     */
    readonly fields: orderFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for order.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__orderClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    customer<T extends Prisma.userDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.userDefaultArgs<ExtArgs>>): Prisma.Prisma__userClient<runtime.Types.Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    providerProfile<T extends Prisma.providerProfileDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.providerProfileDefaultArgs<ExtArgs>>): Prisma.Prisma__providerProfileClient<runtime.Types.Result.GetResult<Prisma.$providerProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    orderItems<T extends Prisma.order$orderItemsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.order$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$orderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the order model
 */
export interface orderFieldRefs {
    readonly id: Prisma.FieldRef<"order", 'String'>;
    readonly customerId: Prisma.FieldRef<"order", 'String'>;
    readonly providerProfileId: Prisma.FieldRef<"order", 'String'>;
    readonly status: Prisma.FieldRef<"order", 'OrderStatus'>;
    readonly deliveryAddress: Prisma.FieldRef<"order", 'String'>;
    readonly deliveryNotes: Prisma.FieldRef<"order", 'String'>;
    readonly totalAmount: Prisma.FieldRef<"order", 'Float'>;
    readonly createdAt: Prisma.FieldRef<"order", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"order", 'DateTime'>;
}
/**
 * order findUnique
 */
export type orderFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter, which order to fetch.
     */
    where: Prisma.orderWhereUniqueInput;
};
/**
 * order findUniqueOrThrow
 */
export type orderFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter, which order to fetch.
     */
    where: Prisma.orderWhereUniqueInput;
};
/**
 * order findFirst
 */
export type orderFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter, which order to fetch.
     */
    where?: Prisma.orderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of orders to fetch.
     */
    orderBy?: Prisma.orderOrderByWithRelationInput | Prisma.orderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for orders.
     */
    cursor?: Prisma.orderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of orders.
     */
    distinct?: Prisma.OrderScalarFieldEnum | Prisma.OrderScalarFieldEnum[];
};
/**
 * order findFirstOrThrow
 */
export type orderFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter, which order to fetch.
     */
    where?: Prisma.orderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of orders to fetch.
     */
    orderBy?: Prisma.orderOrderByWithRelationInput | Prisma.orderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for orders.
     */
    cursor?: Prisma.orderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` orders.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of orders.
     */
    distinct?: Prisma.OrderScalarFieldEnum | Prisma.OrderScalarFieldEnum[];
};
/**
 * order findMany
 */
export type orderFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter, which orders to fetch.
     */
    where?: Prisma.orderWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of orders to fetch.
     */
    orderBy?: Prisma.orderOrderByWithRelationInput | Prisma.orderOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing orders.
     */
    cursor?: Prisma.orderWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` orders from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` orders.
     */
    skip?: number;
    distinct?: Prisma.OrderScalarFieldEnum | Prisma.OrderScalarFieldEnum[];
};
/**
 * order create
 */
export type orderCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * The data needed to create a order.
     */
    data: Prisma.XOR<Prisma.orderCreateInput, Prisma.orderUncheckedCreateInput>;
};
/**
 * order createMany
 */
export type orderCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many orders.
     */
    data: Prisma.orderCreateManyInput | Prisma.orderCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * order createManyAndReturn
 */
export type orderCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * The data used to create many orders.
     */
    data: Prisma.orderCreateManyInput | Prisma.orderCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * order update
 */
export type orderUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * The data needed to update a order.
     */
    data: Prisma.XOR<Prisma.orderUpdateInput, Prisma.orderUncheckedUpdateInput>;
    /**
     * Choose, which order to update.
     */
    where: Prisma.orderWhereUniqueInput;
};
/**
 * order updateMany
 */
export type orderUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update orders.
     */
    data: Prisma.XOR<Prisma.orderUpdateManyMutationInput, Prisma.orderUncheckedUpdateManyInput>;
    /**
     * Filter which orders to update
     */
    where?: Prisma.orderWhereInput;
    /**
     * Limit how many orders to update.
     */
    limit?: number;
};
/**
 * order updateManyAndReturn
 */
export type orderUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * The data used to update orders.
     */
    data: Prisma.XOR<Prisma.orderUpdateManyMutationInput, Prisma.orderUncheckedUpdateManyInput>;
    /**
     * Filter which orders to update
     */
    where?: Prisma.orderWhereInput;
    /**
     * Limit how many orders to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * order upsert
 */
export type orderUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * The filter to search for the order to update in case it exists.
     */
    where: Prisma.orderWhereUniqueInput;
    /**
     * In case the order found by the `where` argument doesn't exist, create a new order with this data.
     */
    create: Prisma.XOR<Prisma.orderCreateInput, Prisma.orderUncheckedCreateInput>;
    /**
     * In case the order was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.orderUpdateInput, Prisma.orderUncheckedUpdateInput>;
};
/**
 * order delete
 */
export type orderDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
    /**
     * Filter which order to delete.
     */
    where: Prisma.orderWhereUniqueInput;
};
/**
 * order deleteMany
 */
export type orderDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which orders to delete
     */
    where?: Prisma.orderWhereInput;
    /**
     * Limit how many orders to delete.
     */
    limit?: number;
};
/**
 * order.orderItems
 */
export type order$orderItemsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the orderItem
     */
    select?: Prisma.orderItemSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the orderItem
     */
    omit?: Prisma.orderItemOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderItemInclude<ExtArgs> | null;
    where?: Prisma.orderItemWhereInput;
    orderBy?: Prisma.orderItemOrderByWithRelationInput | Prisma.orderItemOrderByWithRelationInput[];
    cursor?: Prisma.orderItemWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.OrderItemScalarFieldEnum | Prisma.OrderItemScalarFieldEnum[];
};
/**
 * order without action
 */
export type orderDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the order
     */
    select?: Prisma.orderSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the order
     */
    omit?: Prisma.orderOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.orderInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=order.d.ts.map