import { ensureCsrfToken } from '../utils/session'

export default defineEventHandler(async event => {
    // Always ensure client has a csrf_token cookie
    ensureCsrfToken(event)

    const method = getMethod(event)
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

    if (!isMutation) {
        return
    }

    const path = getRequestPath(event)
    // Skip CSRF check for initial unauthenticated login/refresh if session not yet established
    if (path === '/api/auth/login' || path === '/api/auth/refresh') {
        return
    }

    // Only enforce CSRF on /api/* routes
    if (!path.startsWith('/api/')) {
        return
    }

    const csrfHeader = getRequestHeader(event, 'x-csrf-token')
    const csrfCookie = getCookie(event, 'csrf_token')

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
        throw createError({
            statusCode: 403,
            data: {
                code: 'E_CSRF_INVALID',
                message: 'Invalid or missing CSRF token'
            }
        })
    }
})
