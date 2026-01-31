import { Response } from "express";

// ═══════════════════════════════════════════════════════════
// STANDARD API RESPONSE FORMAT
// ═══════════════════════════════════════════════════════════

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

interface ErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

// ═══════════════════════════════════════════════════════════
// SUCCESS RESPONSE
// ═══════════════════════════════════════════════════════════

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message: string = "Success",
    statusCode: number = 200,
    meta?: SuccessResponse<T>["meta"]
): Response => {
    const response: SuccessResponse<T> = {
        success: true,
        message,
        data,
    };

    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

// ═══════════════════════════════════════════════════════════
// ERROR RESPONSE
// ═══════════════════════════════════════════════════════════

export const sendError = (
    res: Response,
    message: string = "An error occurred",
    statusCode: number = 500,
    errors?: Record<string, string[]>
): Response => {
    const response: ErrorResponse = {
        success: false,
        message,
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

// ═══════════════════════════════════════════════════════════
// SHORTHAND HELPERS
// ═══════════════════════════════════════════════════════════

export const sendCreated = <T>(
    res: Response,
    data: T,
    message: string = "Created successfully"
): Response => sendSuccess(res, data, message, 201);

export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

export const sendNotFound = (
    res: Response,
    message: string = "Resource not found"
): Response => sendError(res, message, 404);

export const sendUnauthorized = (
    res: Response,
    message: string = "Unauthorized"
): Response => sendError(res, message, 401);

export const sendForbidden = (
    res: Response,
    message: string = "Forbidden"
): Response => sendError(res, message, 403);

export const sendBadRequest = (
    res: Response,
    message: string = "Bad request",
    errors?: Record<string, string[]>
): Response => sendError(res, message, 400, errors);
