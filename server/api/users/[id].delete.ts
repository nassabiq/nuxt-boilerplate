import { deleteMockUser } from '~~/server/utils/mock-data'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'
import { getBffSession } from '~~/server/utils/session'

export default defineEventHandler(async event => {
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

    if (id === 1) {
        throw createError({
            statusCode: 403,
            data: {
                code: 'E_FORBIDDEN',
                message: 'Akun Superadmin seeder dilindungi dari penghapusan'
            }
        })
    }

    if (isMockApi(event)) {
        const deleted = deleteMockUser(id)
        if (!deleted) {
            throw createError({
                statusCode: 404,
                data: { code: 'E_NOT_FOUND', message: 'User not found' }
            })
        }
        setResponseStatus(event, 204)
        return null
    }

    await forwardToBackend(event, `/users/${id}`, {
        method: 'DELETE',
        requireAuth: true
    })

    setResponseStatus(event, 204)
    return null
})
