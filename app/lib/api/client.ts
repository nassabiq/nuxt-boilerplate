import { ofetch } from 'ofetch'
import { parseApiError } from './errors'
import { useAuthStore } from '~/stores/auth.store'

let isRedirecting = false

export function getCsrfToken(): string | null {
    if (import.meta.server) {
        const event = useRequestEvent()
        return event ? getCookie(event, 'csrf_token') || null : null
    }
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/)
    return match ? decodeURIComponent(match[1]) : null
}

export function createApiClient(customBaseUrl?: string) {
    const baseURL = customBaseUrl || '/api'

    return ofetch.create({
        baseURL,
        timeout: 15000,
        headers: {
            Accept: 'application/json'
        },
        async onRequest({ options }) {
            const csrfToken = getCsrfToken()
            if (
                csrfToken &&
                options.method &&
                !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())
            ) {
                options.headers = new Headers(options.headers)
                options.headers.set('x-csrf-token', csrfToken)
            }
        },
        async onResponseError({ response }) {
            if (response.status === 401 && import.meta.client) {
                try {
                    const nuxtApp = useNuxtApp()
                    if (nuxtApp?.$pinia) {
                        const auth = useAuthStore(nuxtApp.$pinia)
                        auth.clearAuth()
                    }
                } catch {
                    // Ignore outside Nuxt context
                }

                if (
                    typeof window !== 'undefined' &&
                    window.location.pathname !== '/login' &&
                    !isRedirecting
                ) {
                    isRedirecting = true
                    const current = window.location.pathname + window.location.search
                    try {
                        await navigateTo({
                            path: '/login',
                            query: { redirect: current, expired: 'true' }
                        })
                    } catch {
                        window.location.href = `/login?redirect=${encodeURIComponent(current)}&expired=true`
                    } finally {
                        setTimeout(() => {
                            isRedirecting = false
                        }, 1000)
                    }
                }
            }

            throw parseApiError({
                status: response.status,
                data: response._data
            })
        }
    })
}

export const apiClient = createApiClient()
