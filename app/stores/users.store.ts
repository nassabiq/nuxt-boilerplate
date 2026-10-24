import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    listUsers,
    createUser as apiCreateUser,
    updateUser as apiUpdateUser,
    deleteUser as apiDeleteUser
} from '~/features/users/services/users.service'
import type { User, CreateUserPayload, UpdateUserPayload } from '~~/shared/types/user.types'
import { UserStatus, UserSortOption, sortUsers } from '~~/shared/types/user.types'

export const useUsersStore = defineStore('users', () => {
    const users = ref<User[]>([])
    const totalUsers = ref(0)
    const isLoading = ref(false)
    const errorMessage = ref<string | null>(null)
    const isHydrated = ref(false)

    // Pagination & Search state
    const currentPage = ref(1)
    const pageSize = ref(5)
    const searchQuery = ref('')

    // Filters & Sorting state
    const showFilters = ref(false)
    const statusFilter = ref<string>('all')
    const sortOption = ref<UserSortOption>(UserSortOption.NEWEST)

    // Computed filtered and sorted users over current page
    const filteredUsers = computed(() => {
        let list = [...users.value]

        if (statusFilter.value !== 'all') {
            const statusNum = Number(statusFilter.value)
            list = list.filter(u => u.status_id === statusNum)
        }

        return sortUsers(list, sortOption.value)
    })

    const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value) || 1)

    const activeUsersCount = computed(
        () => users.value.filter(u => u.status_id === UserStatus.ACTIVE).length
    )

    const pendingUsersCount = computed(
        () => users.value.filter(u => u.status_id === UserStatus.PENDING).length
    )

    async function fetchUsers(): Promise<void> {
        isLoading.value = true
        errorMessage.value = null
        try {
            const skip = (currentPage.value - 1) * pageSize.value
            const response = await listUsers({
                skip,
                limit: pageSize.value,
                search: searchQuery.value
            })
            users.value = response.items
            totalUsers.value = response.meta.total
            isHydrated.value = true
        } catch (err: unknown) {
            errorMessage.value = (err as Error).message || 'Gagal memuat data pengguna'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createUser(payload: CreateUserPayload): Promise<User> {
        const created = await apiCreateUser(payload)
        await fetchUsers()
        return created
    }

    async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
        const updated = await apiUpdateUser(id, payload)
        const index = users.value.findIndex(u => u.id === id)
        if (index !== -1) {
            users.value[index] = { ...users.value[index], ...updated }
        }
        return updated
    }

    async function deleteUser(id: number): Promise<void> {
        await apiDeleteUser(id)
        await fetchUsers()
    }

    function resetFilters(): void {
        statusFilter.value = 'all'
        sortOption.value = UserSortOption.NEWEST
        searchQuery.value = ''
        currentPage.value = 1
    }

    function setPage(page: number): void {
        currentPage.value = page
    }

    return {
        users,
        totalUsers,
        isLoading,
        errorMessage,
        isHydrated,
        currentPage,
        pageSize,
        searchQuery,
        showFilters,
        statusFilter,
        sortOption,
        filteredUsers,
        totalPages,
        activeUsersCount,
        pendingUsersCount,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        resetFilters,
        setPage
    }
})
