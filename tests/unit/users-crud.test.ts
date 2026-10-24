import { describe, it, expect } from 'vitest'
import {
    createUserSchema,
    updateUserSchema,
    toCreateUserPayload,
    toUpdateUserPayload
} from '../../app/features/users/schemas/user.schema'
import {
    UserStatus,
    isSuperAdminUser,
    UserSortOption,
    sortUsers,
    USER_SORT_LABELS
} from '../../shared/types/user.types'
import { updateMockUser, resetMockStore, createMockUser } from '../../server/utils/mock-data'

describe('Users Schema Validation & Concurrency', () => {
    it('validates valid create user payload', () => {
        const valid = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'StrongPassword123!'
        }
        const result = createUserSchema.safeParse(valid)
        expect(result.success).toBe(true)
    })

    it('rejects passwords missing uppercase, lowercase, number, or special char', () => {
        expect(
            createUserSchema.safeParse({ name: 'A', email: 'a@a.com', password: 'password123' })
                .success
        ).toBe(false)
        expect(
            createUserSchema.safeParse({ name: 'A', email: 'a@a.com', password: 'PASSWORD123!' })
                .success
        ).toBe(false)
        expect(
            createUserSchema.safeParse({ name: 'A', email: 'a@a.com', password: 'Password!!!!!' })
                .success
        ).toBe(false)
        expect(
            createUserSchema.safeParse({ name: 'A', email: 'a@a.com', password: 'Password1234' })
                .success
        ).toBe(false)
        expect(
            createUserSchema.safeParse({ name: 'A', email: 'a@a.com', password: 'Password123!' })
                .success
        ).toBe(true)
    })

    it('rejects invalid email or short password in create user', () => {
        const invalid = {
            name: '',
            email: 'not-an-email',
            password: 'short'
        }
        const result = createUserSchema.safeParse(invalid)
        expect(result.success).toBe(false)
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors
            expect(fieldErrors.name).toBeDefined()
            expect(fieldErrors.email).toBeDefined()
            expect(fieldErrors.password).toBeDefined()
        }
    })

    it('validates update payload without password and requires valid version', () => {
        const valid = {
            name: 'Updated Name',
            email: 'updated@example.com',
            status_id: UserStatus.ACTIVE,
            version: 2
        }
        const result = updateUserSchema.safeParse(valid)
        expect(result.success).toBe(true)

        const missingVersion = {
            name: 'Updated Name',
            email: 'updated@example.com',
            status_id: UserStatus.ACTIVE
        }
        const invalidResult = updateUserSchema.safeParse(missingVersion)
        expect(invalidResult.success).toBe(false)

        const invalidEmail = {
            name: 'Updated Name',
            email: 'invalid-email',
            status_id: UserStatus.ACTIVE,
            version: 1
        }
        expect(updateUserSchema.safeParse(invalidEmail).success).toBe(false)
    })

    it('enforces optimistic locking on update and rejects version mismatch with 409', () => {
        resetMockStore()

        // Current version for user 1 is 1
        const updated = updateMockUser(1, {
            name: 'Admin Name Updated',
            email: 'admin@example.com',
            status_id: UserStatus.ACTIVE,
            version: 1
        })
        expect(updated.version).toBe(2)

        // Attempting to update with stale version 1 now throws 409
        expect(() => {
            updateMockUser(1, {
                name: 'Stale Attempt',
                email: 'admin@example.com',
                status_id: UserStatus.ACTIVE,
                version: 1
            })
        }).toThrow()
    })

    it('creates mock user and assigns initial version 1', () => {
        resetMockStore()
        const user = createMockUser({
            name: 'New Test User',
            email: 'newuser@example.com',
            password: 'password123'
        })
        expect(user.id).toBeGreaterThan(0)
        expect(user.version).toBe(1)
    })

    it('correctly identifies seeded superadmin to protect from edit/delete', () => {
        expect(isSuperAdminUser({ id: 1, email: 'admin@example.com' })).toBe(true)
        expect(isSuperAdminUser({ id: 1, email: 'custom@example.com' })).toBe(true)
        expect(isSuperAdminUser({ id: 99, email: 'admin@example.com' })).toBe(true)
        expect(isSuperAdminUser({ id: 2, email: 'sarah@example.com' })).toBe(false)
        expect(isSuperAdminUser(null)).toBe(false)
    })

    it('sorts users by strategy enum and handles unknown gracefully', () => {
        const u1 = {
            id: 1,
            name: 'Charlie',
            email: 'c@a.com',
            status_id: UserStatus.ACTIVE,
            version: 1,
            created_at: '',
            updated_at: ''
        }
        const u2 = {
            id: 2,
            name: 'Alice',
            email: 'a@a.com',
            status_id: UserStatus.ACTIVE,
            version: 1,
            created_at: '',
            updated_at: ''
        }
        const u3 = {
            id: 3,
            name: 'Bob',
            email: 'b@a.com',
            status_id: UserStatus.ACTIVE,
            version: 1,
            created_at: '',
            updated_at: ''
        }
        const list = [u1, u2, u3]

        expect(sortUsers(list, UserSortOption.NEWEST).map(u => u.id)).toEqual([3, 2, 1])
        expect(sortUsers(list, UserSortOption.OLDEST).map(u => u.id)).toEqual([1, 2, 3])
        expect(sortUsers(list, UserSortOption.NAME_ASC).map(u => u.name)).toEqual([
            'Alice',
            'Bob',
            'Charlie'
        ])
        expect(sortUsers(list, UserSortOption.NAME_DESC).map(u => u.name)).toEqual([
            'Charlie',
            'Bob',
            'Alice'
        ])
        expect(sortUsers(list, 'unknown-sort')).toEqual(list)
        expect(USER_SORT_LABELS[UserSortOption.NEWEST]).toBeDefined()
    })

    it('transforms form values into sanitized payloads via domain mappers', () => {
        const createPayload = toCreateUserPayload({
            name: '  John Doe  ',
            email: '  JOHN@EXAMPLE.COM  ',
            password: 'Password123!'
        })
        expect(createPayload).toEqual({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'Password123!'
        })

        const updatePayloadWithVersion = toUpdateUserPayload(
            {
                name: '  Jane Doe  ',
                email: '  JANE@EXAMPLE.COM  ',
                status_id: UserStatus.ACTIVE,
                version: 3
            },
            1
        )
        expect(updatePayloadWithVersion).toEqual({
            name: 'Jane Doe',
            email: 'jane@example.com',
            status_id: UserStatus.ACTIVE,
            version: 3
        })

        const updatePayloadFallbackVersion = toUpdateUserPayload(
            {
                name: 'Jane',
                email: 'jane@example.com',
                status_id: UserStatus.PENDING
            },
            2
        )
        expect(updatePayloadFallbackVersion.version).toBe(2)

        const updatePayloadZeroVersionFallback = toUpdateUserPayload(
            {
                name: 'Jane',
                email: 'jane@example.com',
                status_id: UserStatus.PENDING,
                version: 0
            },
            0
        )
        expect(updatePayloadZeroVersionFallback.version).toBe(1)
    })
})
