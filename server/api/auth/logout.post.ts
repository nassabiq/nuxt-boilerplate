import { getBffSession } from '~~/server/utils/session'
import { forwardToBackend, isMockApi } from '~~/server/utils/bff-proxy'

export default defineEventHandler(async event => {
    const session = await getBffSession(event)

    if (!isMockApi(event) && session.data.accessToken) {
        try {
            await forwardToBackend(event, '/auth/logout', {
                method: 'POST',
                requireAuth: true
            })
        } catch {
            // Ignore upstream failure during logout cleanup
        }
    }

    await session.clear()
    setResponseStatus(event, 204)
    return null
})
