import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    verifyMockCredentials,
    getMockUserById,
    generateMockAuthTokens,
    resetMockStore,
    getMockUsersList
} from '../../server/utils/mock-data'
import { isMockApi } from '../../server/utils/bff-proxy'
import { UserStatus } from '../../shared/types/user.types'

describe('BFF Mock Data Store and Auth Lifecycle', () => {
    const origNuxtMock = process.env.NUXT_MOCK_API
    const origMock = process.env.MOCK_API

    beforeEach(() => {
        resetMockStore()
    })

    afterEach(() => {
        if (origNuxtMock !== undefined) {
            process.env.NUXT_MOCK_API = origNuxtMock
        } else {
            delete process.env.NUXT_MOCK_API
        }
        if (origMock !== undefined) {
            process.env.MOCK_API = origMock
        } else {
            delete process.env.MOCK_API
        }
    })

    it('correctly evaluates isMockApi boolean and string values', () => {
        delete process.env.NUXT_MOCK_API
        delete process.env.MOCK_API

        process.env.NUXT_MOCK_API = 'true'
        expect(isMockApi()).toBe(true)

        process.env.NUXT_MOCK_API = 'false'
        expect(isMockApi()).toBe(false)

        process.env.NUXT_MOCK_API = '"false"'
        expect(isMockApi()).toBe(false)

        process.env.NUXT_MOCK_API = '1'
        expect(isMockApi()).toBe(true)

        process.env.NUXT_MOCK_API = '0'
        expect(isMockApi()).toBe(false)

        delete process.env.NUXT_MOCK_API
        process.env.MOCK_API = 'false'
        expect(isMockApi()).toBe(false)
    })

    it('validates mock credentials correctly', () => {
        const user = verifyMockCredentials('admin@example.com', 'password123')
        expect(user).not.toBeNull()
        expect(user?.email).toBe('admin@example.com')
        expect(user?.status_id).toBe(UserStatus.ACTIVE)

        const invalid = verifyMockCredentials('admin@example.com', 'wrongpassword')
        expect(invalid).toBeNull()

        const notFound = verifyMockCredentials('unknown@example.com', 'password123')
        expect(notFound).toBeNull()
    })

    it('generates compliant auth token payload', () => {
        const tokens = generateMockAuthTokens(1)
        expect(tokens.token_type).toBe('Bearer')
        expect(tokens.access_token).toBeDefined()
        expect(tokens.refresh_token).toBeDefined()
        expect(tokens.expires_in).toBe(3600)
    })

    it('retrieves user profile by ID with version field', () => {
        const user = getMockUserById(1)
        expect(user).toBeDefined()
        expect(user?.id).toBe(1)
        expect(user?.version).toBeGreaterThanOrEqual(1)
    })

    it('contains users with various statuses', () => {
        const users = getMockUsersList()
        expect(users.some(u => u.status_id === UserStatus.ACTIVE)).toBe(true)
        expect(users.some(u => u.status_id === UserStatus.PENDING)).toBe(true)
        expect(users.some(u => u.status_id === UserStatus.INACTIVE)).toBe(true)
    })
})
