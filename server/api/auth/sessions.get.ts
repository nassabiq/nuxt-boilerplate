import { getBffSession } from '~~/server/utils/session'
import { listMockSessions } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import type { SessionInfo } from '~~/shared/types/auth.types'

export default defineEventHandler(async (event): Promise<SessionInfo[]> => {
    const session = await getBffSession(event)
    if (!session.data?.accessToken || !session.data?.userId) {
        throw createError({
            statusCode: 401,
            data: { code: 'E_UNAUTHORIZED', message: 'No active session' }
        })
    }

    if (isMockApi(event)) {
        return listMockSessions(session.data.userId)
    }

    return (await forwardToBackend(event, '/auth/sessions', {
        method: 'GET',
        requireAuth: true
    })) as SessionInfo[]
})
