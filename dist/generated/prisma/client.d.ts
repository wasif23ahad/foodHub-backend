import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model user
 *
 */
export type user = Prisma.userModel;
/**
 * Model session
 *
 */
export type session = Prisma.sessionModel;
/**
 * Model account
 *
 */
export type account = Prisma.accountModel;
/**
 * Model verification
 *
 */
export type verification = Prisma.verificationModel;
/**
 * Model providerProfile
 *
 */
export type providerProfile = Prisma.providerProfileModel;
/**
 * Model category
 *
 */
export type category = Prisma.categoryModel;
/**
 * Model meal
 *
 */
export type meal = Prisma.mealModel;
/**
 * Model order
 *
 */
export type order = Prisma.orderModel;
/**
 * Model orderItem
 *
 */
export type orderItem = Prisma.orderItemModel;
/**
 * Model review
 *
 */
export type review = Prisma.reviewModel;
//# sourceMappingURL=client.d.ts.map