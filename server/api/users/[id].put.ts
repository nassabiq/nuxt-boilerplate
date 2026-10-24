import { updateMockUser } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import { getBffSession } from '~~/server/utils/session'
import type { UpdateUserPayload, User } from '~~/shared/types/user.types'

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

    const body = await readBody<UpdateUserPayload>(event)

    if (!body?.email || !body?.name || !body?.status_id || body?.version === undefined) {
        throw createError({
            statusCode: 400,
            data: {
                code: 'E_VALIDATION',
                message: 'Name, email, status_id, and version are required'
            }
        })
    }

    if (isMockApi(event)) {
        return updateMockUser(id, body)
    }

    return (await forwardToBackend(event, `/users/${id}`, {
        method: 'PUT',
        body: {
            name: body.name.trim(),
            email: body.email.trim().toLowerCase(),
            status_id: Number(body.status_id),
            version: Number(body.version)
        },
        requireAuth: true
    })) as User
})
