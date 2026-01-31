import { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma/client";
import "../types";
export declare const requireRole: (...allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireProvider: (req: Request, _res: Response, next: NextFunction) => void;
export declare const requireCustomer: (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireRole.d.ts.map