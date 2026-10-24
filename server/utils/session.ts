import type { H3Event } from 'h3'
import { randomBytes } from 'node:crypto'

export interface BffSessionData {
    accessToken?: string
    refreshToken?: string
    userId?: number
    expiresAt?: number
}

export async function getBffSession(event: H3Event) {
    const config = useRuntimeConfig(event)
    return await useSession<BffSessionData>(event, {
        name: 'bff_session',
        password: config.sessionPassword,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        }
    })
}

export function ensureCsrfToken(event: H3Event): string {
    const existing = getCookie(event, 'csrf_token')
    if (existing) {
        return existing
    }

    const token = randomBytes(24).toString('hex')
    setCookie(event, 'csrf_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })
    return token
}
