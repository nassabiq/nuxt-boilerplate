<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUsersStore } from '~/stores/users.store'
import type { User } from '~~/shared/types/user.types'
import { USER_STATUS_LABELS, USER_SORT_LABELS, isSuperAdminUser } from '~~/shared/types/user.types'
import PageBreadcrumb from '~/components/shared/PageBreadcrumb.vue'
import ComponentCard from '~/components/shared/ComponentCard.vue'
import UserTable from '~/features/users/components/UserTable.vue'
import UserFormDialog from '~/features/users/components/UserFormDialog.vue'
import UserDeleteDialog from '~/features/users/components/UserDeleteDialog.vue'
import { Button } from '~/components/ui/button'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '~/components/ui/select'
import {
    Pagination,
    PaginationList,
    PaginationListItem,
    PaginationPrev,
    PaginationNext
} from '~/components/ui/pagination'
import { useToast } from '~/components/ui/toast'
import { Plus, Search, RefreshCw, AlertCircle, X, Filter, FilterX } from 'lucide-vue-next'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
})

const { toast } = useToast()
const usersStore = useUsersStore()

const {
    users,
    totalUsers,
    isLoading,
    errorMessage,
    currentPage,
    pageSize,
    searchQuery,
    showFilters,
    statusFilter,
    sortOption,
    filteredUsers
} = storeToRefs(usersStore)

const { fetchUsers, resetFilters } = usersStore

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Dialog state
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedUser = ref<User | null>(null)

onMounted(() => {
    fetchUsers()
})

watch(currentPage, () => {
    fetchUsers()
})

function handleSearch() {
    if (searchTimeout) {
        clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        fetchUsers()
    }, 300)
}

function clearSearch() {
    searchQuery.value = ''
    currentPage.value = 1
    fetchUsers()
}

function openCreateDialog() {
    selectedUser.value = null
    isFormOpen.value = true
}

function openEditDialog(user: User) {
    if (isSuperAdminUser(user)) return
    selectedUser.value = { ...user }
    isFormOpen.value = true
}

function openDeleteDialog(user: User) {
    if (isSuperAdminUser(user)) return
    selectedUser.value = user
    isDeleteOpen.value = true
}

function onUserSaved(savedUser: User) {
    toast({
        title: selectedUser.value ? 'Pengguna diperbarui' : 'Pengguna dibuat',
        description: `Berhasil menyimpan data ${savedUser.name}.`,
        variant: 'success'
    })
    fetchUsers()
}

function onUserDeleted() {
    toast({
        title: 'Pengguna dihapus',
        description: 'Data pengguna telah berhasil dihapus.',
        variant: 'default'
    })
    fetchUsers()
}

async function onReloadRequired() {
    await fetchUsers()
    if (selectedUser.value) {
        const fresh = users.value.find(u => u.id === selectedUser.value?.id)
        if (fresh) {
            selectedUser.value = { ...fresh }
            toast({
                title: 'Data dimuat ulang',
                description: 'Memuat versi rekaman terbaru dari server.',
                variant: 'default'
            })
        }
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- TailAdmin Page Breadcrumb at top of page content -->
        <PageBreadcrumb page-title="Manajemen Pengguna" />

        <!-- TailAdmin ComponentCard wrapping the table and toolbar -->
        <ComponentCard
            title="Daftar Pengguna"
            desc="Kelola akun pengguna, hak akses, dan versi record."
        >
            <template #actions>
                <Button class="gap-2 rounded-lg shadow-xs" @click="openCreateDialog">
                    <Plus class="h-4 w-4" />
                    Tambah Pengguna
                </Button>
            </template>

            <!-- Toolbar: Search, Filter Toggle & Refresh matching gpci-cms -->
            <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="relative flex-1">
                    <Search
                        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Cari berdasarkan nama atau email..."
                        class="w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-9 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-gray-200"
                        @input="handleSearch"
                    />
                    <button
                        v-if="searchQuery"
                        type="button"
                        aria-label="Hapus pencarian"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                        @click="clearSearch"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>

                <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        class="justify-center gap-2 sm:w-auto border-gray-200 dark:border-gray-700"
                        @click="showFilters = !showFilters"
                    >
                        <FilterX v-if="showFilters" class="h-4 w-4" />
                        <Filter v-else class="h-4 w-4" />
                        {{ showFilters ? 'Tutup Filter' : 'Filter' }}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        class="justify-center gap-2 sm:w-auto border-gray-200 dark:border-gray-700"
                        :disabled="isLoading"
                        aria-label="Segarkan data pengguna"
                        @click="fetchUsers"
                    >
                        <RefreshCw :class="['h-4 w-4', isLoading && 'animate-spin']" />
                        Segarkan
                    </Button>
                </div>
            </div>

            <!-- Collapsible Filter Panel matching gpci-cms -->
            <transition name="fade">
                <div
                    v-if="showFilters"
                    class="mb-4 space-y-4 rounded-xl border border-gray-100 p-4 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs"
                >
                    <div class="grid gap-4 md:grid-cols-2">
                        <!-- Status Filter -->
                        <div>
                            <label
                                for="filter-status"
                                class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Filter Status
                            </label>
                            <Select v-model="statusFilter">
                                <SelectTrigger
                                    id="filter-status"
                                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent
                                    class="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem
                                        v-for="(label, key) in USER_STATUS_LABELS"
                                        :key="key"
                                        :value="String(key)"
                                    >
                                        {{ label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <!-- Sort Option -->
                        <div>
                            <label
                                for="filter-sort"
                                class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Urutkan
                            </label>
                            <Select v-model="sortOption">
                                <SelectTrigger
                                    id="filter-sort"
                                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                >
                                    <SelectValue placeholder="Pilih urutan" />
                                </SelectTrigger>
                                <SelectContent
                                    class="rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                >
                                    <SelectItem
                                        v-for="(label, key) in USER_SORT_LABELS"
                                        :key="key"
                                        :value="key"
                                    >
                                        {{ label }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div class="flex items-center justify-end pt-1">
                        <Button
                            type="button"
                            variant="destructive"
                            class="justify-center rounded-lg px-4 py-2 text-sm font-medium"
                            :disabled="isLoading"
                            @click="resetFilters"
                        >
                            Reset Filter
                        </Button>
                    </div>
                </div>
            </transition>

            <!-- Error Banner -->
            <div
                v-if="errorMessage"
                class="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between"
            >
                <div class="flex items-center gap-2">
                    <AlertCircle class="h-4 w-4 shrink-0" />
                    <span>{{ errorMessage }}</span>
                </div>
                <Button variant="ghost" size="sm" class="h-8 text-xs rounded-lg" @click="fetchUsers"
                    >Coba Lagi</Button
                >
            </div>

            <!-- Users Table -->
            <UserTable
                :users="filteredUsers"
                :is-loading="isLoading"
                @edit="openEditDialog"
                @delete="openDeleteDialog"
            />

            <!-- Pagination Controls at bottom of card -->
            <div
                class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40"
            >
                <p class="text-xs text-muted-foreground">
                    Menampilkan
                    <span class="font-semibold text-foreground">{{
                        filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
                    }}</span>
                    sampai
                    <span class="font-semibold text-foreground">{{
                        Math.min(currentPage * pageSize, totalUsers)
                    }}</span>
                    dari
                    <span class="font-semibold text-foreground">{{ totalUsers }}</span> pengguna
                </p>

                <Pagination
                    v-if="totalUsers > pageSize"
                    v-model:page="currentPage"
                    :total="totalUsers"
                    :items-per-page="pageSize"
                    :sibling-count="1"
                    show-edges
                >
                    <PaginationList v-slot="{ items }">
                        <PaginationPrev />
                        <template v-for="(item, index) in items">
                            <PaginationListItem
                                v-if="item.type === 'page'"
                                :key="index"
                                :value="item.value"
                                as-child
                            >
                                <Button
                                    class="w-9 h-9 p-0 text-xs rounded-lg"
                                    :variant="item.value === currentPage ? 'default' : 'outline'"
                                >
                                    {{ item.value }}
                                </Button>
                            </PaginationListItem>
                        </template>
                        <PaginationNext />
                    </PaginationList>
                </Pagination>
            </div>
        </ComponentCard>

        <!-- Modals -->
        <UserFormDialog
            v-model:open="isFormOpen"
            :user="selectedUser"
            @saved="onUserSaved"
            @reload-required="onReloadRequired"
        />

        <UserDeleteDialog
            v-model:open="isDeleteOpen"
            :user="selectedUser"
            @deleted="onUserDeleted"
        />
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>
