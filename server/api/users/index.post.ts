import { createMockUser } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import { getBffSession } from '~~/server/utils/session'
import type { CreateUserPayload, User } from '~~/shared/types/user.types'

export default defineEventHandler(async (event): Promise<User> => {
    const session = await getBffSession(event)
    if (!session.data?.accessToken && !session.data?.userId) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_UNAUTHORIZED', message: 'No active session' }
        })
    }

    const body = await readBody<CreateUserPayload>(event)

    if (!body?.email || !body?.name || !body?.password) {
        throw createError({
            statusCode: 400,
            data: { code: 'E_VALIDATION', message: 'Name, email, and password are required' }
        })
    }

    const name = body.name.trim()
    const email = body.email.trim().toLowerCase()
    const password = body.password

    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasDigit = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    if (
        password.length < 8 ||
        password.length > 72 ||
        !hasUpper ||
        !hasLower ||
        !hasDigit ||
        !hasSpecial
    ) {
        throw createError({
            statusCode: 400,
            data: {
                code: 'E_VAL_1',
                message:
                    'Password must be 8-72 characters with at least one uppercase, lowercase, number, and special character'
            }
        })
    }

    const payload: CreateUserPayload = { name, email, password }

    if (isMockApi(event)) {
        return createMockUser(payload)
    }

    return (await forwardToBackend(event, '/users', {
        method: 'POST',
        body: payload,
        requireAuth: true
    })) as User
})
