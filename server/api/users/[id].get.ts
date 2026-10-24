import { getMockUserById } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import { getBffSession } from '~~/server/utils/session'
import type { User } from '~~/shared/types/user.types'

export default defineEventHandler(async (event): Promise<User> => {
    const session = await getBffSession(event)
    if (!session.data?.accessToken && !session.data?.userId) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_UNAUTHORIZED', message: 'No active session' }
        })
    }

    const idParam = getRouterParam(event, 'id')
    const id = Number(idParam)

    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            data: { code: 'E_VALIDATION', message: 'Valid user ID is required' }
        })
    }

    if (isMockApi(event)) {
        const user = getMockUserById(id)
        if (!user) {
            throw createError({
                statusCode: 404,
                data: { code: 'E_NOT_FOUND', message: 'User not found' }
            })
        }
        return user
    }

    return (await forwardToBackend(event, `/users/${id}`, {
        method: 'GET',
        requireAuth: true
    })) as User
})
