<script setup lang="ts">
import type { User } from '~~/shared/types/user.types'
import { UserStatus, USER_STATUS_LABELS, isSuperAdminUser } from '~~/shared/types/user.types'
import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from '~/components/ui/dropdown-menu'
import { Edit2, Trash2, UserX, ChevronDown } from 'lucide-vue-next'

defineProps<{
    users: User[]
    isLoading?: boolean
}>()

const emits = defineEmits<{
    (e: 'edit' | 'delete', user: User): void
}>()

function getStatusVariant(
    statusId: UserStatus
): 'success' | 'warning' | 'destructive' | 'secondary' | 'default' {
    switch (statusId) {
        case UserStatus.ACTIVE:
            return 'success'
        case UserStatus.PENDING:
            return 'warning'
        case UserStatus.SUSPENDED:
        case UserStatus.BLOCKED:
            return 'destructive'
        case UserStatus.INACTIVE:
        default:
            return 'secondary'
    }
}

function formatDate(isoString: string): string {
    try {
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch {
        return isoString
    }
}
</script>

<template>
    <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
        <div class="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow
                        class="bg-gray-50/75 hover:bg-gray-50/75 dark:bg-gray-800/40 dark:hover:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800"
                    >
                        <TableHead
                            class="w-20 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >ID</TableHead
                        >
                        <TableHead
                            class="min-w-[220px] font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >Pengguna</TableHead
                        >
                        <TableHead
                            class="w-36 font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >Status</TableHead
                        >
                        <TableHead
                            class="w-28 font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >Versi</TableHead
                        >
                        <TableHead
                            class="w-36 font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >Dibuat</TableHead
                        >
                        <TableHead
                            class="w-28 text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground px-5 py-3.5"
                            >Aksi</TableHead
                        >
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <!-- Loading State Skeleton -->
                    <template v-if="isLoading">
                        <TableRow
                            v-for="i in 5"
                            :key="`skeleton-${i}`"
                            class="animate-pulse border-b border-border/50"
                        >
                            <TableCell class="px-5 py-4">
                                <div class="h-4 w-6 bg-muted rounded" />
                            </TableCell>
                            <TableCell class="px-5 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="h-9 w-9 rounded-full bg-muted" />
                                    <div class="space-y-1.5">
                                        <div class="h-4 w-32 bg-muted rounded" />
                                        <div class="h-3 w-44 bg-muted rounded" />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell class="px-5 py-4">
                                <div class="h-6 w-20 bg-muted rounded-full" />
                            </TableCell>
                            <TableCell class="px-5 py-4">
                                <div class="h-4 w-8 bg-muted rounded" />
                            </TableCell>
                            <TableCell class="px-5 py-4">
                                <div class="h-4 w-24 bg-muted rounded" />
                            </TableCell>
                            <TableCell class="px-5 py-4 text-right">
                                <div class="h-8 w-20 bg-muted rounded ml-auto" />
                            </TableCell>
                        </TableRow>
                    </template>

                    <!-- Empty State -->
                    <TableRow v-else-if="users.length === 0">
                        <TableCell colspan="6" class="h-56 text-center">
                            <div
                                class="flex flex-col items-center justify-center space-y-2.5 text-muted-foreground"
                            >
                                <div class="p-3.5 rounded-full bg-muted/60 text-muted-foreground">
                                    <UserX class="h-6 w-6 stroke-[1.5]" />
                                </div>
                                <p class="font-semibold text-sm text-foreground">
                                    Tidak ada pengguna ditemukan
                                </p>
                                <p class="text-xs max-w-sm">
                                    Tidak ada data yang cocok dengan kriteria pencarian atau filter
                                    Anda.
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>

                    <!-- User Rows -->
                    <TableRow
                        v-for="user in users"
                        v-else
                        :key="user.id"
                        class="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-150 border-b border-gray-100 dark:border-gray-800"
                    >
                        <TableCell
                            class="font-mono text-xs text-gray-500 dark:text-gray-400 font-semibold px-5 py-4"
                        >
                            #{{ user.id }}
                        </TableCell>
                        <TableCell class="px-5 py-4">
                            <div class="flex items-center gap-3">
                                <img
                                    v-if="user.avatar_url"
                                    :src="user.avatar_url"
                                    :alt="user.name"
                                    class="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                />
                                <div
                                    v-else
                                    class="h-9 w-9 rounded-full bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-300 flex items-center justify-center text-xs font-semibold shrink-0"
                                >
                                    {{ user.name.charAt(0) }}
                                </div>
                                <div class="min-w-0">
                                    <div class="flex items-center gap-1.5">
                                        <p
                                            class="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate"
                                        >
                                            {{ user.name }}
                                        </p>
                                        <span
                                            v-if="isSuperAdminUser(user)"
                                            class="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-brand-50 text-brand-600 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20 select-none"
                                        >
                                            Superadmin
                                        </span>
                                    </div>
                                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {{ user.email }}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell class="px-5 py-4">
                            <Badge :variant="getStatusVariant(user.status_id)">
                                <span
                                    :class="[
                                        'h-1.5 w-1.5 rounded-full shrink-0',
                                        user.status_id === UserStatus.ACTIVE && 'bg-primary',
                                        user.status_id === UserStatus.PENDING && 'bg-amber-500',
                                        (user.status_id === UserStatus.SUSPENDED ||
                                            user.status_id === UserStatus.BLOCKED) &&
                                            'bg-rose-500',
                                        user.status_id === UserStatus.INACTIVE &&
                                            'bg-muted-foreground'
                                    ]"
                                />
                                <span>{{ USER_STATUS_LABELS[user.status_id] || 'Unknown' }}</span>
                            </Badge>
                        </TableCell>
                        <TableCell class="font-mono text-xs px-5 py-4">
                            <span
                                class="inline-block px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium text-xs"
                            >
                                v{{ user.version }}
                            </span>
                        </TableCell>
                        <TableCell
                            class="text-xs text-gray-500 dark:text-gray-400 tabular-nums px-5 py-4"
                        >
                            {{ formatDate(user.created_at) }}
                        </TableCell>
                        <TableCell class="text-right px-5 py-4">
                            <!-- Actions Dropdown: Hidden for seeded superadmin -->
                            <DropdownMenu v-if="!isSuperAdminUser(user)">
                                <DropdownMenuTrigger as-child>
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-2xs"
                                    >
                                        Actions
                                        <ChevronDown class="h-3.5 w-3.5 opacity-60" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    class="w-36 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                                >
                                    <DropdownMenuItem
                                        class="cursor-pointer rounded-md text-xs font-medium py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                        @click="emits('edit', user)"
                                    >
                                        <Edit2
                                            class="mr-2 h-3.5 w-3.5 text-gray-500 dark:text-gray-400"
                                        />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        class="cursor-pointer rounded-md text-xs font-medium py-2 text-destructive focus:text-destructive focus:bg-destructive/10 dark:text-red-400 dark:focus:bg-red-500/10"
                                        @click="emits('delete', user)"
                                    >
                                        <Trash2
                                            class="mr-2 h-3.5 w-3.5 text-destructive dark:text-red-400"
                                        />
                                        Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span
                                v-else
                                class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-400 dark:text-gray-500 select-none"
                                title="Akun Superadmin seeder dilindungi dari edit dan hapus"
                            >
                                Terkunci
                            </span>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    </div>
</template>
