import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../app/stores/auth.store'
import * as clientModule from '../../app/lib/api/client'

describe('Auth Pinia Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.restoreAllMocks()
    })

    it('initializes with default unauthenticated state', () => {
        const auth = useAuthStore()
        expect(auth.user).toBeNull()
        expect(auth.isAuthenticated).toBe(false)
        expect(auth.isLoading).toBe(false)
    })

    it('updates state on successful login', async () => {
        const mockUser = {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            status_id: 2,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        vi.spyOn(clientModule, 'apiClient').mockImplementation(async (url: string) => {
            if (url === '/auth/login') {
                return { user: mockUser } as never
            }
            return null as never
        })

        const auth = useAuthStore()
        await auth.login('admin@example.com', 'password123')

        expect(auth.user).toEqual(mockUser)
        expect(auth.isAuthenticated).toBe(true)
    })

    it('clears state on logout', async () => {
        vi.spyOn(clientModule, 'apiClient').mockImplementation(async () => null as never)

        const auth = useAuthStore()
        auth.user = {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            status_id: 2,
            version: 1,
            created_at: '',
            updated_at: ''
        }

        await auth.logout()
        expect(auth.user).toBeNull()
        expect(auth.isAuthenticated).toBe(false)
    })

    it('fetches fresh profile with force=true and clears state on failure', async () => {
        const mockUser = {
            id: 2,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            status_id: 2,
            version: 1,
            created_at: '',
            updated_at: ''
        }

        vi.spyOn(clientModule, 'apiClient').mockImplementation(async (url: string) => {
            if (url === '/auth/me') {
                return mockUser as never
            }
            throw new Error('Not found')
        })

        const auth = useAuthStore()
        const user = await auth.fetchMe(true)
        expect(user).toEqual(mockUser)
        expect(auth.user).toEqual(mockUser)
        expect(auth.isAuthenticated).toBe(true)

        // Now simulate session expiry / 401 on /auth/me
        vi.spyOn(clientModule, 'apiClient').mockRejectedValue(new Error('Unauthorized'))
        const expiredResult = await auth.fetchMe(true)
        expect(expiredResult).toBeNull()
        expect(auth.user).toBeNull()
        expect(auth.isAuthenticated).toBe(false)
    })

    it('clears auth state on handleSessionExpired', async () => {
        const auth = useAuthStore()
        auth.user = {
            id: 1,
            name: 'Admin',
            email: 'admin@example.com',
            status_id: 2,
            version: 1,
            created_at: '',
            updated_at: ''
        }
        auth.isHydrated = true

        await auth.handleSessionExpired()
        expect(auth.user).toBeNull()
        expect(auth.isHydrated).toBe(false)
        expect(auth.isAuthenticated).toBe(false)
    })
})
