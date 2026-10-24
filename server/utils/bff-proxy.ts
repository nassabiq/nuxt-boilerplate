import type { H3Event } from 'h3'
import { ofetch, FetchError } from 'ofetch'
import { getBffSession } from './session'
import type { AuthTokens } from '~~/shared/types/auth.types'

const refreshLocks = new Map<string, Promise<string | null>>()

export function isMockApi(event?: H3Event): boolean {
    try {
        const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
        const val = config?.mockApi
        if (typeof val === 'boolean') return val
        if (typeof val === 'string') {
            const s = val
                .trim()
                .toLowerCase()
                .replace(/^["']|["']$/g, '')
            return s === 'true' || s === '1'
        }
    } catch {
        // Fallback to process.env if called outside Nitro event lifecycle
        const envVal = process.env.NUXT_MOCK_API ?? process.env.MOCK_API
        if (envVal !== undefined) {
            const s = String(envVal)
                .trim()
                .toLowerCase()
                .replace(/^["']|["']$/g, '')
            return s === 'true' || s === '1'
        }
    }
    return false
}

export async function forwardToBackend(
    event: H3Event,
    path: string,
    options: {
        method?: string
        body?: unknown
        query?: Record<string, string | number | boolean>
        requireAuth?: boolean
        isPublicAuthRoute?: boolean
    } = {}
) {
    const config = useRuntimeConfig(event)
    const session = await getBffSession(event)
    const sessionData = session.data

    const headers: Record<string, string> = {
        Accept: 'application/json'
    }

    // Attach Basic Auth if configured and route is public auth
    if (
        options.isPublicAuthRoute &&
        config.backendBasicAuthUsername &&
        config.backendBasicAuthPassword
    ) {
        const credentials = Buffer.from(
            `${config.backendBasicAuthUsername}:${config.backendBasicAuthPassword}`
        ).toString('base64')
        headers.Authorization = `Basic ${credentials}`
    }

    // Attach Bearer token if required
    if (options.requireAuth && sessionData.accessToken) {
        headers.Authorization = `Bearer ${sessionData.accessToken}`
    }

    const upstreamUrl = `${config.apiBaseUrl}${path}`

    async function executeRequest(authToken?: string) {
        const reqHeaders = { ...headers }
        if (authToken) {
            reqHeaders.Authorization = `Bearer ${authToken}`
        }

        return await ofetch(upstreamUrl, {
            method: options.method || 'GET',
            headers: reqHeaders,
            body: options.body,
            query: options.query
        })
    }

    try {
        return await executeRequest()
    } catch (err) {
        if (
            err instanceof FetchError &&
            err.status === 401 &&
            options.requireAuth &&
            sessionData.refreshToken
        ) {
            // Handle transparent token rotation with per-token mutex deduplication
            const newAccessToken = await handleTokenRefresh(
                event,
                config.apiBaseUrl,
                sessionData.refreshToken
            )
            if (newAccessToken) {
                // Retry the original request with the fresh token
                return await executeRequest(newAccessToken)
            }
        }

        // Forward upstream error with exact status and code
        if (err instanceof FetchError) {
            throw createError({
                statusCode: err.status || 500,
                statusMessage: err.statusText,
                data: err.data || { code: `E_HTTP_${err.status || 500}`, message: err.message }
            })
        }

        throw createError({
            statusCode: 500,
            data: {
                code: 'E_PROXY_ERROR',
                message: (err as Error).message || 'Upstream gateway error'
            }
        })
    }
}

async function handleTokenRefresh(
    event: H3Event,
    baseUrl: string,
    refreshToken: string
): Promise<string | null> {
    const lockKey = refreshToken
    let lock = refreshLocks.get(lockKey)

    if (!lock) {
        lock = (async () => {
            try {
                const response = await ofetch<AuthTokens>(`${baseUrl}/auth/refresh`, {
                    method: 'POST',
                    body: { refresh_token: refreshToken }
                })

                const session = await getBffSession(event)
                await session.update({
                    accessToken: response.access_token,
                    refreshToken: response.refresh_token,
                    expiresAt: Date.now() + response.expires_in * 1000
                })

                return response.access_token
            } catch {
                // Refresh token invalid or revoked -> clear session
                const session = await getBffSession(event)
                await session.clear()
                return null
            } finally {
                refreshLocks.delete(lockKey)
            }
        })()

        refreshLocks.set(lockKey, lock)
    }

    return await lock
}

/**
 * @deprecated Use forwardToBackend instead
 */
export const forwardToGoChi = forwardToBackend
