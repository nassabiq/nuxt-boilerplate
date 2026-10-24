import { getBffSession } from '~~/server/utils/session'
import { getMockUserById } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import type { User } from '~~/shared/types/user.types'

export default defineEventHandler(async (event): Promise<User> => {
    const session = await getBffSession(event)
    const sessionData = session.data

    if (!sessionData?.accessToken || !sessionData?.userId) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_UNAUTHORIZED', message: 'No active session' }
        })
    }

    if (isMockApi(event)) {
        if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
            await session.clear()
            throw createError({
                statusCode: 401,
                data: { code: 'E_AUTH_2', message: 'Session expired' }
            })
        }

        const user = getMockUserById(sessionData.userId)
        if (!user) {
            await session.clear()
            throw createError({
                statusCode: 401,
                data: { code: 'E_AUTH_5', message: 'User not found or session revoked' }
            })
        }
        return user
    }

    return (await forwardToBackend(event, '/auth/me', {
        method: 'GET',
        requireAuth: true
    })) as User
})
