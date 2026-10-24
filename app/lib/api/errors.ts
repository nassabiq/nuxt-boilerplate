import type { ApiErrorResponse, ApiFieldError } from '~~/shared/types/api.types'

export type { ApiFieldError }

export class ApiError extends Error {
    public readonly status: number
    public readonly code: string
    public readonly raw?: unknown

    constructor(status: number, code: string, message: string, raw?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.raw = raw
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class ValidationError extends ApiError {
    public readonly errors: ApiFieldError[]

    constructor(
        status: number,
        code: string,
        message: string,
        raw?: unknown,
        errors: ApiFieldError[] = []
    ) {
        super(status, code, message, raw)
        this.name = 'ValidationError'
        this.errors = errors
    }
}

export class UnauthorizedError extends ApiError {
    constructor(code = 'E_UNAUTHORIZED', message = 'Unauthorized', raw?: unknown) {
        super(401, code, message, raw)
        this.name = 'UnauthorizedError'
    }
}

export class ForbiddenError extends ApiError {
    constructor(code = 'E_FORBIDDEN', message = 'Forbidden', raw?: unknown) {
        super(403, code, message, raw)
        this.name = 'ForbiddenError'
    }
}

export class NotFoundError extends ApiError {
    constructor(code = 'E_NOT_FOUND', message = 'Resource not found', raw?: unknown) {
        super(404, code, message, raw)
        this.name = 'NotFoundError'
    }
}

export class ConflictError extends ApiError {
    constructor(code = 'E_CONFLICT', message = 'Resource version mismatch', raw?: unknown) {
        super(409, code, message, raw)
        this.name = 'ConflictError'
    }
}

export class RateLimitError extends ApiError {
    constructor(code = 'E_RATE_LIMIT', message = 'Too many requests', raw?: unknown) {
        super(429, code, message, raw)
        this.name = 'RateLimitError'
    }
}

interface ErrorContext {
    status?: number
    data?: unknown
}

export function parseApiError(error: ErrorContext): ApiError {
    const status = error.status || 500
    const rawData = error.data as Record<string, unknown> | undefined

    // Nitro errors wrap custom data in error.data.data
    const data =
        rawData?.data && typeof rawData.data === 'object'
            ? (rawData.data as ApiErrorResponse)
            : (rawData as ApiErrorResponse | undefined)

    const code = typeof data?.code === 'string' && data.code ? data.code : `E_HTTP_${status}`
    const message =
        typeof data?.message === 'string' && data.message
            ? data.message
            : typeof rawData?.message === 'string' && rawData.message
              ? rawData.message
              : 'An unexpected error occurred'

    const fieldErrors: ApiFieldError[] = Array.isArray(data?.errors)
        ? data.errors
        : Array.isArray(rawData?.errors)
          ? (rawData.errors as ApiFieldError[])
          : []

    switch (status) {
        case 400:
        case 422:
            return new ValidationError(status, code, message, rawData, fieldErrors)
        case 401:
            return new UnauthorizedError(code, message, rawData)
        case 403:
            return new ForbiddenError(code, message, rawData)
        case 404:
            return new NotFoundError(code, message, rawData)
        case 409:
            return new ConflictError(code, message, rawData)
        case 429:
            return new RateLimitError(code, message, rawData)
        default:
            return new ApiError(status, code, message, rawData)
    }
}
