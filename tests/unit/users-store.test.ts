import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from '../../app/stores/users.store'
import * as usersService from '../../app/features/users/services/users.service'
import { UserStatus, UserSortOption } from '../../shared/types/user.types'

describe('Users Pinia Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.restoreAllMocks()
    })

    const sampleUsers = [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@example.com',
            status_id: UserStatus.ACTIVE,
            version: 1,
            created_at: '',
            updated_at: ''
        },
        {
            id: 2,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            status_id: UserStatus.PENDING,
            version: 1,
            created_at: '',
            updated_at: ''
        }
    ]

    it('initializes with default state', () => {
        const store = useUsersStore()
        expect(store.users).toEqual([])
        expect(store.totalUsers).toBe(0)
        expect(store.isLoading).toBe(false)
        expect(store.currentPage).toBe(1)
        expect(store.pageSize).toBe(5)
        expect(store.searchQuery).toBe('')
        expect(store.statusFilter).toBe('all')
        expect(store.sortOption).toBe(UserSortOption.NEWEST)
    })

    it('fetches users and updates state', async () => {
        vi.spyOn(usersService, 'listUsers').mockResolvedValue({
            items: sampleUsers,
            meta: { skip: 0, limit: 5, total: 2 }
        })

        const store = useUsersStore()
        await store.fetchUsers()

        expect(store.users).toHaveLength(2)
        expect(store.totalUsers).toBe(2)
        expect(store.isHydrated).toBe(true)
        expect(store.activeUsersCount).toBe(1)
        expect(store.pendingUsersCount).toBe(1)
        expect(store.totalPages).toBe(1)
    })

    it('filters and sorts users correctly', () => {
        const store = useUsersStore()
        store.users = [...sampleUsers]

        // Status filter
        store.statusFilter = String(UserStatus.ACTIVE)
        expect(store.filteredUsers).toHaveLength(1)
        expect(store.filteredUsers[0].name).toBe('Admin User')

        store.statusFilter = 'all'
        // Sort option oldest
        store.sortOption = UserSortOption.OLDEST
        expect(store.filteredUsers[0].id).toBe(1)

        // Sort option newest
        store.sortOption = UserSortOption.NEWEST
        expect(store.filteredUsers[0].id).toBe(2)

        // Name sorting
        store.sortOption = UserSortOption.NAME_ASC
        expect(store.filteredUsers[0].name).toBe('Admin User')
        store.sortOption = UserSortOption.NAME_DESC
        expect(store.filteredUsers[0].name).toBe('Sarah Connor')
    })

    it('resets filters cleanly', () => {
        const store = useUsersStore()
        store.statusFilter = '1'
        store.sortOption = UserSortOption.OLDEST
        store.searchQuery = 'keyword'
        store.currentPage = 3

        store.resetFilters()
        expect(store.statusFilter).toBe('all')
        expect(store.sortOption).toBe(UserSortOption.NEWEST)
        expect(store.searchQuery).toBe('')
        expect(store.currentPage).toBe(1)
    })

    it('updates user in state on updateUser', async () => {
        const updated = {
            id: 2,
            name: 'Sarah Connor Updated',
            email: 'sarah@example.com',
            status_id: UserStatus.ACTIVE,
            version: 2,
            created_at: '',
            updated_at: ''
        }
        vi.spyOn(usersService, 'updateUser').mockResolvedValue(updated)

        const store = useUsersStore()
        store.users = [...sampleUsers]

        await store.updateUser(2, {
            name: 'Sarah Connor Updated',
            email: 'sarah@example.com',
            status_id: UserStatus.ACTIVE,
            version: 1
        })

        expect(store.users.find(u => u.id === 2)?.name).toBe('Sarah Connor Updated')
        expect(store.users.find(u => u.id === 2)?.version).toBe(2)
    })
})
