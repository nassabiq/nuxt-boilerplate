import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    login,
    logout,
    getMe,
    refresh,
    listSessions
} from '../../app/features/auth/services/auth.service'
import { loginSchema } from '../../app/features/auth/schemas/auth.schema'
import * as clientModule from '../../app/lib/api/client'

describe('Auth Feature Service & Schema', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('loginSchema validation', () => {
        it('validates correct email and password', () => {
            const valid = { email: 'admin@example.com', password: 'password123' }
            expect(loginSchema.safeParse(valid).success).toBe(true)
        })

        it('rejects empty or invalid email', () => {
            expect(loginSchema.safeParse({ email: '', password: 'p' }).success).toBe(false)
            expect(loginSchema.safeParse({ email: 'notanemail', password: 'p' }).success).toBe(
                false
            )
        })

        it('rejects empty password', () => {
            expect(loginSchema.safeParse({ email: 'a@a.com', password: '' }).success).toBe(false)
        })
    })

    describe('auth service HTTP calls', () => {
        it('calls login endpoint correctly', async () => {
            const mockResponse = {
                user: {
                    id: 1,
                    name: 'Admin',
                    email: 'admin@example.com',
                    status_id: 2,
                    version: 1,
                    created_at: '',
                    updated_at: ''
                }
            }
            const spy = vi.spyOn(clientModule, 'apiClient').mockResolvedValue(mockResponse as never)

            const res = await login({ email: 'admin@example.com', password: 'password123' })
            expect(spy).toHaveBeenCalledWith('/auth/login', {
                method: 'POST',
                body: { email: 'admin@example.com', password: 'password123' }
            })
            expect(res).toEqual(mockResponse)
        })

        it('calls logout endpoint with POST', async () => {
            const spy = vi.spyOn(clientModule, 'apiClient').mockResolvedValue(null as never)
            await logout()
            expect(spy).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
        })

        it('calls getMe endpoint', async () => {
            const mockUser = {
                id: 1,
                name: 'Admin',
                email: 'admin@example.com',
                status_id: 2,
                version: 1,
                created_at: '',
                updated_at: ''
            }
            const spy = vi.spyOn(clientModule, 'apiClient').mockResolvedValue(mockUser as never)
            const user = await getMe()
            expect(spy).toHaveBeenCalledWith('/auth/me')
            expect(user).toEqual(mockUser)
        })

        it('calls refresh endpoint with POST', async () => {
            const spy = vi.spyOn(clientModule, 'apiClient').mockResolvedValue(null as never)
            await refresh()
            expect(spy).toHaveBeenCalledWith('/auth/refresh', { method: 'POST' })
        })

        it('calls listSessions endpoint', async () => {
            const mockSessions = [
                {
                    id: 's1',
                    user_id: '1',
                    ip_address: '127.0.0.1',
                    user_agent: 'agent',
                    created_at: 1,
                    expires_at: 2
                }
            ]
            const spy = vi.spyOn(clientModule, 'apiClient').mockResolvedValue(mockSessions as never)
            const sessions = await listSessions()
            expect(spy).toHaveBeenCalledWith('/auth/sessions')
            expect(sessions).toEqual(mockSessions)
        })
    })
})
