import { apiClient } from '~/lib/api/client'
import type { LoginPayload, LoginResponse, SessionInfo } from '~~/shared/types/auth.types'
import type { User } from '~~/shared/types/user.types'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    return await apiClient<LoginResponse>('/auth/login', {
        method: 'POST',
        body: payload
    })
}

export async function logout(): Promise<void> {
    await apiClient('/auth/logout', {
        method: 'POST'
    })
}

export async function getMe(): Promise<User> {
    return await apiClient<User>('/auth/me')
}

export async function refresh(): Promise<void> {
    await apiClient('/auth/refresh', {
        method: 'POST'
    })
}

export async function listSessions(): Promise<SessionInfo[]> {
    return await apiClient<SessionInfo[]>('/auth/sessions')
}
