// ═══════════════════════════════════════════════════════════
// CUSTOM ERROR CLASSES
// ═══════════════════════════════════════════════════════════

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errors: Record<string, string[]> | undefined;

    constructor(
        message: string,
        statusCode: number = 500,
        isOperational: boolean = true,
        errors?: Record<string, string[]>
    ) {
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
    constructor(message: string = "Resource not found") {
        super(message, 404);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized access") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Access forbidden") {
        super(message, 403);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad request", errors?: Record<string, string[]>) {
        super(message, 400, true, errors);
    }
}

export class ValidationError extends AppError {
    constructor(errors: Record<string, string[]>) {
        super("Validation failed", 400, true, errors);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Resource already exists") {
        super(message, 409);
    }
}
