import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
type ValidationTarget = "body" | "query" | "params";
interface ValidateOptions {
    target?: ValidationTarget;
}
export declare const validate: (schema: ZodSchema, options?: ValidateOptions) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateBody: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.d.ts.map