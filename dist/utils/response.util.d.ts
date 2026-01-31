import { Response } from "express";
interface SuccessResponse<T> {
    success: true;
    message: string;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number, meta?: SuccessResponse<T>["meta"]) => Response;
export declare const sendError: (res: Response, message?: string, statusCode?: number, errors?: Record<string, string[]>) => Response;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => Response;
export declare const sendNoContent: (res: Response) => Response;
export declare const sendNotFound: (res: Response, message?: string) => Response;
export declare const sendUnauthorized: (res: Response, message?: string) => Response;
export declare const sendForbidden: (res: Response, message?: string) => Response;
export declare const sendBadRequest: (res: Response, message?: string, errors?: Record<string, string[]>) => Response;
export {};
//# sourceMappingURL=response.util.d.ts.map