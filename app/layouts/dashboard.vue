<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useUiStore } from '~/stores/ui.store'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import HorizontalDots from '~/components/shared/icons/HorizontalDots.vue'
import { Toaster, useToast } from '~/components/ui/toast'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'
import { LayoutDashboard, Users, LogOut, ChevronDown, Menu, X, UserCheck } from 'lucide-vue-next'

const auth = useAuthStore()
const ui = useUiStore()
const {
    isSidebarExpanded: isExpanded,
    isSidebarMobileOpen: isMobileOpen,
    isSidebarHovered: isHovered
} = storeToRefs(ui)
const { toggleSidebar: handleToggle } = ui

const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const isActive = (path: string) => {
    if (route.path === path) return true
    if (path === '/dashboard') return false
    return route.path.startsWith(`${path}/`)
}

const menuGroups = [
    {
        title: 'Menu',
        items: [
            {
                icon: LayoutDashboard,
                name: 'Dashboard',
                path: '/dashboard'
            }
        ]
    },
    {
        title: 'Users Management',
        items: [
            {
                icon: Users,
                name: 'Daftar Pengguna',
                path: '/dashboard/users'
            }
        ]
    }
]

async function handleLogout() {
    await auth.logout()
    toast({
        title: 'Signed out',
        description: 'You have been safely signed out.',
        variant: 'default'
    })
    router.push('/login')
}

// Session Watchdog: Proactively check session expiration & handle refresh failure
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null

async function verifyActiveSession() {
    if (!auth.isAuthenticated) return
    const currentUser = await auth.fetchMe(true)
    if (!currentUser) {
        await auth.handleSessionExpired()
    }
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        verifyActiveSession()
    }
}

onMounted(() => {
    // Proactively verify session every 60 seconds
    sessionCheckInterval = setInterval(verifyActiveSession, 60 * 1000)

    if (typeof window !== 'undefined') {
        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', verifyActiveSession)
    }
})

onUnmounted(() => {
    if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval)
        sessionCheckInterval = null
    }
    if (typeof window !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('focus', verifyActiveSession)
    }
})
</script>

<template>
    <div
        class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 font-sans antialiased"
    >
        <!-- Backdrop for Mobile -->
        <div
            v-if="isMobileOpen"
            class="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
            @click="isMobileOpen = false"
        />

        <!-- TailAdmin AppSidebar -->
        <aside
            :class="[
                'fixed top-0 left-0 z-50 flex flex-col h-screen px-5 bg-white border-r border-gray-200 text-gray-900 transition-all duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100',
                {
                    'lg:w-[290px]': isExpanded || isMobileOpen || isHovered,
                    'lg:w-[90px]': !isExpanded && !isHovered,
                    'translate-x-0 w-[290px]': isMobileOpen,
                    '-translate-x-full': !isMobileOpen,
                    'lg:translate-x-0': true
                }
            ]"
            @mouseenter="!isExpanded && (isHovered = true)"
            @mouseleave="isHovered = false"
        >
            <!-- LOGO -->
            <div
                :class="[
                    'py-8 flex items-center',
                    !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
                ]"
            >
                <NuxtLink to="/dashboard" class="flex items-center gap-3">
                    <div
                        class="h-10 w-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0"
                    >
                        N
                    </div>
                    <div
                        v-if="isExpanded || isHovered || isMobileOpen"
                        class="flex flex-col leading-tight"
                    >
                        <span
                            class="text-2xl font-semibold uppercase tracking-wide text-gray-900 dark:text-white"
                        >
                            NUXT ADMIN
                        </span>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                            Enterprise Portal
                        </span>
                    </div>
                </NuxtLink>
            </div>

            <!-- Navigation Menu -->
            <div class="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1">
                <nav class="mb-6">
                    <div class="flex flex-col gap-4">
                        <div v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
                            <h2
                                :class="[
                                    'mb-4 text-xs uppercase flex leading-[20px] text-gray-400 dark:text-gray-500 font-medium',
                                    !isExpanded && !isHovered
                                        ? 'lg:justify-center'
                                        : 'justify-start px-3'
                                ]"
                            >
                                <template v-if="isExpanded || isHovered || isMobileOpen">
                                    {{ group.title }}
                                </template>
                                <HorizontalDots v-else class="text-gray-400 dark:text-gray-500" />
                            </h2>

                            <ul class="flex flex-col gap-2">
                                <li v-for="item in group.items" :key="item.name">
                                    <NuxtLink
                                        :to="item.path"
                                        :class="[
                                            'menu-item group',
                                            {
                                                'menu-item-active': isActive(item.path),
                                                'menu-item-inactive': !isActive(item.path)
                                            },
                                            !isExpanded && !isHovered
                                                ? 'lg:justify-center'
                                                : 'justify-start'
                                        ]"
                                        @click="isMobileOpen = false"
                                    >
                                        <span
                                            :class="[
                                                isActive(item.path)
                                                    ? 'menu-item-icon-active'
                                                    : 'menu-item-icon-inactive'
                                            ]"
                                        >
                                            <component :is="item.icon" class="h-5 w-5 shrink-0" />
                                        </span>
                                        <span
                                            v-if="isExpanded || isHovered || isMobileOpen"
                                            class="menu-item-text truncate"
                                        >
                                            {{ item.name }}
                                        </span>
                                    </NuxtLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </aside>

        <!-- Main Content Area with Dynamic Margin -->
        <div
            class="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
            :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']"
        >
            <!-- Topbar Header -->
            <header
                class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95"
            >
                <div class="flex items-center gap-3">
                    <!-- Toggle Button -->
                    <button
                        type="button"
                        class="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        :title="isExpanded ? 'Ciutkan sidebar' : 'Perluas sidebar'"
                        :aria-label="isExpanded ? 'Ciutkan sidebar' : 'Perluas sidebar'"
                        @click="handleToggle"
                    >
                        <X v-if="isMobileOpen" class="h-5 w-5" />
                        <Menu v-else class="h-5 w-5" />
                    </button>

                    <!-- Mobile Header Logo -->
                    <NuxtLink to="/dashboard" class="flex items-center gap-2 lg:hidden">
                        <div
                            class="h-8 w-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-base shadow-xs"
                        >
                            N
                        </div>
                        <span
                            class="text-lg font-semibold uppercase tracking-wide text-gray-900 dark:text-white"
                        >
                            Nuxt Admin
                        </span>
                    </NuxtLink>
                </div>

                <div class="flex items-center gap-3">
                    <ThemeToggle />

                    <!-- User Menu Dropdown -->
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <button
                                type="button"
                                class="flex items-center gap-2.5 p-1 rounded-xl text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                <div
                                    class="h-10 w-10 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-semibold text-sm dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-300"
                                >
                                    {{ auth.user?.name?.charAt(0) || 'A' }}
                                </div>
                                <span
                                    class="hidden sm:inline font-medium text-sm text-gray-700 dark:text-gray-300"
                                >
                                    {{ auth.user?.name || 'Administrator' }}
                                </span>
                                <ChevronDown class="h-4 w-4 text-gray-400 hidden sm:block" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            class="w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900"
                            align="end"
                        >
                            <div
                                class="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-gray-800"
                            >
                                <div
                                    class="h-11 w-11 rounded-full bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center font-semibold text-base dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-300"
                                >
                                    {{ auth.user?.name?.charAt(0) || 'A' }}
                                </div>
                                <div class="flex flex-col min-w-0">
                                    <span
                                        class="block text-sm font-semibold text-gray-800 dark:text-white/90 truncate"
                                        >{{ auth.user?.name || 'User' }}</span
                                    >
                                    <span
                                        class="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 truncate"
                                        >{{ auth.user?.email || '' }}</span
                                    >
                                </div>
                            </div>

                            <div class="py-2">
                                <DropdownMenuItem
                                    class="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                                >
                                    <UserCheck class="mr-2 h-4 w-4 text-brand-500" />
                                    <span>Akun Aktif</span>
                                </DropdownMenuItem>
                            </div>

                            <DropdownMenuSeparator
                                class="my-1 border-gray-100 dark:border-gray-800"
                            />

                            <DropdownMenuItem
                                class="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 focus:text-red-600 focus:bg-red-50"
                                @click="handleLogout"
                            >
                                <LogOut class="mr-2 h-4 w-4 text-red-500 dark:text-red-400" />
                                <span>Keluar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <!-- Main Page Slot -->
            <main class="flex-1 p-4 mx-auto max-w-7xl w-full sm:px-6 md:px-8 md:py-6">
                <slot />
            </main>
        </div>

        <Toaster />
    </div>
</template>
