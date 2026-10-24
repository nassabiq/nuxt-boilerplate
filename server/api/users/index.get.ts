import { listMockUsers } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import { getBffSession } from '~~/server/utils/session'
import type { UserListResponse } from '~~/shared/types/user.types'

export default defineEventHandler(async (event): Promise<UserListResponse> => {
    const session = await getBffSession(event)
    if (!session.data?.accessToken && !session.data?.userId) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_UNAUTHORIZED', message: 'No active session' }
        })
    }

    const query = getQuery(event)
    const skip = Number(query.skip) || 0
    const limit = Number(query.limit) || 10
    const search = typeof query.search === 'string' ? query.search : ''

    if (isMockApi(event)) {
        const { items, total } = listMockUsers(skip, limit, search)
        return {
            items,
            meta: { skip, limit, total }
        }
    }

    return (await forwardToBackend(event, '/users', {
        method: 'GET',
        query: { skip, limit, search },
        requireAuth: true
    })) as UserListResponse
})
