// ═══════════════════════════════════════════════════════════
// CUSTOM ERROR CLASSES
// ═══════════════════════════════════════════════════════════
export class AppError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(message, statusCode = 500, isOperational = true, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        // Maintains proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}
// ═══════════════════════════════════════════════════════════
// SPECIFIC ERROR TYPES
// ═══════════════════════════════════════════════════════════
export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized access") {
        super(message, 401);
    }
}
export class ForbiddenError extends AppError {
    constructor(message = "Access forbidden") {
        super(message, 403);
    }
}
export class BadRequestError extends AppError {
    constructor(message = "Bad request", errors) {
        super(message, 400, true, errors);
    }
}
export class ValidationError extends AppError {
    constructor(errors) {
        super("Validation failed", 400, true, errors);
    }
}
export class ConflictError extends AppError {
    constructor(message = "Resource already exists") {
        super(message, 409);
    }
}
//# sourceMappingURL=AppError.js.map