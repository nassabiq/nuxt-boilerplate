import { describe, it, expect } from 'vitest'
import {
    ApiError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    RateLimitError,
    parseApiError
} from '../../app/lib/api/errors'

describe('API Client Error Handling', () => {
    it('correctly maps 400 and 422 to ValidationError with field errors', () => {
        const err400 = parseApiError({
            status: 400,
            data: {
                data: {
                    code: 'E_VAL_1',
                    message: 'validation failed',
                    errors: [{ field: 'version', message: 'version is required' }]
                }
            }
        })
        expect(err400).toBeInstanceOf(ValidationError)
        const valErr = err400 as ValidationError
        expect(valErr.code).toBe('E_VAL_1')
        expect(valErr.message).toBe('validation failed')
        expect(valErr.status).toBe(400)
        expect(valErr.errors).toHaveLength(1)
        expect(valErr.errors[0]).toEqual({ field: 'version', message: 'version is required' })

        const err422 = parseApiError({
            status: 422,
            data: {
                code: 'E_VALIDATION',
                message: 'Email invalid',
                errors: [{ field: 'email', message: 'invalid email format' }]
            }
        })
        expect(err422).toBeInstanceOf(ValidationError)
        expect((err422 as ValidationError).errors).toHaveLength(1)
        expect(err422.status).toBe(422)
    })

    it('correctly maps 401 to UnauthorizedError', () => {
        const err = parseApiError({
            status: 401,
            data: { code: 'E_AUTH_1', message: 'Invalid credentials' }
        })
        expect(err).toBeInstanceOf(UnauthorizedError)
        expect(err.code).toBe('E_AUTH_1')
        expect(err.status).toBe(401)
    })

    it('correctly maps 403 to ForbiddenError', () => {
        const err = parseApiError({
            status: 403,
            data: { code: 'E_AUTH_9', message: 'Account is inactive' }
        })
        expect(err).toBeInstanceOf(ForbiddenError)
        expect(err.code).toBe('E_AUTH_9')
    })

    it('correctly maps 409 to ConflictError with optimistic locking info', () => {
        const err = parseApiError({
            status: 409,
            data: { code: 'E_CONFLICT', message: 'Resource version mismatch' }
        })
        expect(err).toBeInstanceOf(ConflictError)
        expect(err.code).toBe('E_CONFLICT')
        expect(err.status).toBe(409)
    })

    it('correctly maps 429 to RateLimitError', () => {
        const err = parseApiError({
            status: 429,
            data: { code: 'E_AUTH_7', message: 'Too many login attempts' }
        })
        expect(err).toBeInstanceOf(RateLimitError)
        expect(err.code).toBe('E_AUTH_7')
    })

    it('falls back to generic ApiError on unexpected status or structure', () => {
        const err = parseApiError({
            status: 500,
            data: { code: 'E_INTERNAL', message: 'Internal server error' }
        })
        expect(err).toBeInstanceOf(ApiError)
        expect(err.status).toBe(500)
        expect(err.message).toBe('Internal server error')
    })
})
