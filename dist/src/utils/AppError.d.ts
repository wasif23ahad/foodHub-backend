export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly errors: Record<string, string[]> | undefined;
    constructor(message: string, statusCode?: number, isOperational?: boolean, errors?: Record<string, string[]>);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, errors?: Record<string, string[]>);
}
export declare class ValidationError extends AppError {
    constructor(errors: Record<string, string[]>);
}
export declare class ConflictError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=AppError.d.ts.map