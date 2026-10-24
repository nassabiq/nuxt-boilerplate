import type { User } from './user.types'

export interface AuthTokens {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResponse {
    user: User
}

export interface SessionInfo {
    id: string
    user_id: string
    ip_address: string
    user_agent: string
    created_at: number
    expires_at: number
}
