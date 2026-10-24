import { getBffSession } from '~~/server/utils/session'
import { generateMockAuthTokens } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import type { AuthTokens } from '~~/shared/types/auth.types'

export default defineEventHandler(async event => {
    const session = await getBffSession(event)
    const sessionData = session.data

    if (!sessionData?.refreshToken) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_AUTH_8', message: 'No refresh token in session' }
        })
    }

    if (isMockApi(event)) {
        const tokens = generateMockAuthTokens(sessionData.userId || 1)
        await session.update({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000
        })
        return { success: true }
    }

    try {
        const tokens = (await forwardToBackend(event, '/auth/refresh', {
            method: 'POST',
            body: { refresh_token: sessionData.refreshToken },
            isPublicAuthRoute: true
        })) as AuthTokens

        await session.update({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000
        })

        return { success: true }
    } catch (err) {
        await session.clear()
        throw err
    }
})
