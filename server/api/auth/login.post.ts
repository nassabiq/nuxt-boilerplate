import { getBffSession } from '~~/server/utils/session'
import { verifyMockCredentials, generateMockAuthTokens } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import type { LoginPayload, LoginResponse, AuthTokens } from '~~/shared/types/auth.types'
import type { User } from '~~/shared/types/user.types'
import { UserStatus } from '~~/shared/types/user.types'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
    const body = await readBody<LoginPayload>(event)

    if (!body?.email || !body?.password) {
        throw createError({
            statusCode: 400,
            data: { code: 'E_VALIDATION', message: 'Email and password are required' }
        })
    }

    const session = await getBffSession(event)

    if (isMockApi(event)) {
        const user = verifyMockCredentials(body.email, body.password)
        if (!user) {
            throw createError({
                statusCode: 401,
                data: { code: 'E_AUTH_1', message: 'Invalid email or password' }
            })
        }

        if (user.status_id === UserStatus.PENDING) {
            throw createError({
                statusCode: 403,
                data: { code: 'E_AUTH_10', message: 'Account is pending email verification' }
            })
        }

        if (user.status_id === UserStatus.INACTIVE) {
            throw createError({
                statusCode: 403,
                data: { code: 'E_AUTH_9', message: 'Account is deactivated' }
            })
        }

        if (user.status_id === UserStatus.SUSPENDED) {
            throw createError({
                statusCode: 403,
                data: { code: 'E_AUTH_11', message: 'Account is suspended' }
            })
        }

        if (user.status_id === UserStatus.BLOCKED) {
            throw createError({
                statusCode: 403,
                data: { code: 'E_AUTH_12', message: 'Account is blocked' }
            })
        }

        const tokens = generateMockAuthTokens(user.id)
        await session.update({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            userId: user.id,
            expiresAt: Date.now() + tokens.expires_in * 1000
        })

        return { user }
    }

    // Real upstream backend integration
    const tokens = (await forwardToBackend(event, '/auth/login', {
        method: 'POST',
        body: { email: body.email, password: body.password },
        isPublicAuthRoute: true
    })) as AuthTokens

    await session.update({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000
    })

    // Hydrate user profile from /auth/me
    const user = (await forwardToBackend(event, '/auth/me', {
        method: 'GET',
        requireAuth: true
    })) as User

    await session.update({ userId: user.id })

    return { user }
})
