<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users.store'
import { useAuthStore } from '~/stores/auth.store'
import PageBreadcrumb from '~/components/shared/PageBreadcrumb.vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
    Users,
    Shield,
    Server,
    Zap,
    ArrowRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    Plus
} from 'lucide-vue-next'

definePageMeta({
    layout: 'dashboard',
    middleware: 'auth'
})

const auth = useAuthStore()
const usersStore = useUsersStore()

onMounted(async () => {
    if (!usersStore.isHydrated) {
        try {
            await usersStore.fetchUsers()
        } catch {
            // Non-blocking for dashboard metrics
        }
    }
})

const metrics = computed(() => [
    {
        title: 'Total Pengguna',
        value: usersStore.isHydrated ? String(usersStore.totalUsers) : 'Memuat...',
        subtext: `${usersStore.activeUsersCount} akun aktif terdaftar`,
        icon: Users
    },
    {
        title: 'Sesi Autentikasi',
        value: auth.user ? auth.user.name : 'BFF Session',
        subtext: 'HttpOnly cookie terenkripsi',
        icon: Shield
    },
    {
        title: 'Backend Gateway',
        value: 'Upstream REST',
        subtext: 'Token mutex & auto-refresh',
        icon: Server
    },
    {
        title: 'Konkurensi Data',
        value: 'Optimistic Locking',
        subtext: 'Version guard aktif',
        icon: Zap
    }
])

const recentEvents = [
    {
        id: 1,
        event: 'Sesi Administrator Aktif',
        detail: 'Terautentikasi melalui BFF cookie dengan enkripsi H3',
        time: 'Baru saja',
        status: 'Verified'
    },
    {
        id: 2,
        event: 'Optimistic Concurrency Lock',
        detail: 'Pengecekan versi rekaman aktif untuk mencegah tabrakan data',
        time: '5 menit lalu',
        status: 'Active'
    },
    {
        id: 3,
        event: 'Go Chi Proxy Synchronized',
        detail: 'Rute backend terhubung dengan proteksi CORS & CSRF',
        time: '12 menit lalu',
        status: 'Healthy'
    }
]
</script>

<template>
    <div class="space-y-6">
        <!-- TailAdmin Page Breadcrumb at top of content -->
        <PageBreadcrumb page-title="Dashboard" />

        <!-- TailAdmin Stat Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div
                v-for="stat in metrics"
                :key="stat.title"
                class="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 shadow-xs transition-all hover:border-brand-500/40 hover:shadow-sm"
            >
                <div class="flex items-center justify-between">
                    <div class="min-w-0">
                        <p
                            class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                        >
                            {{ stat.title }}
                        </p>
                        <p
                            class="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate"
                        >
                            {{ stat.value }}
                        </p>
                    </div>
                    <span
                        class="rounded-full bg-brand-50 dark:bg-brand-500/10 p-3.5 text-brand-500 dark:text-brand-400 shrink-0 shadow-2xs"
                    >
                        <component :is="stat.icon" class="h-6 w-6" />
                    </span>
                </div>
                <p
                    class="mt-4 text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1.5"
                >
                    <TrendingUp class="h-3.5 w-3.5" />
                    <span>{{ stat.subtext }}</span>
                </p>
            </div>
        </div>

        <!-- TailAdmin Main Section: Showcase & Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Feature Card -->
            <Card class="lg:col-span-2">
                <CardHeader class="p-6 pb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <CardTitle class="text-lg font-bold text-foreground"
                                >Manajemen Pengguna</CardTitle
                            >
                            <CardDescription class="text-xs mt-1">
                                Fitur CRUD dengan pagination skip/limit dan deteksi konflik HTTP
                                409.
                            </CardDescription>
                        </div>
                        <div class="flex items-center gap-2">
                            <NuxtLink to="/dashboard/users">
                                <Button size="sm" class="gap-1.5 text-xs rounded-xl shadow-xs">
                                    <Plus class="h-3.5 w-3.5" />
                                    Tambah Pengguna
                                </Button>
                            </NuxtLink>
                            <NuxtLink to="/dashboard/users">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="gap-1.5 text-xs text-primary hover:text-primary hover:bg-accent rounded-xl"
                                >
                                    Buka
                                    <ArrowRight class="h-3.5 w-3.5" />
                                </Button>
                            </NuxtLink>
                        </div>
                    </div>
                </CardHeader>
                <CardContent class="p-6 pt-0 space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div
                            class="p-4 rounded-xl border border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02] space-y-1.5"
                        >
                            <div
                                class="flex items-center gap-2 font-semibold text-xs text-gray-900 dark:text-gray-100"
                            >
                                <CheckCircle2 class="h-4 w-4 text-brand-500" />
                                Optimistic Locking (409)
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Mencegah overwrite data saat dua sesi mengedit bersamaan dengan
                                verifikasi versi rekaman.
                            </p>
                        </div>

                        <div
                            class="p-4 rounded-xl border border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02] space-y-1.5"
                        >
                            <div
                                class="flex items-center gap-2 font-semibold text-xs text-gray-900 dark:text-gray-100"
                            >
                                <CheckCircle2 class="h-4 w-4 text-brand-500" />
                                Skip/Limit Pagination
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Parameter pagination native Go Chi REST dengan kalkulasi total
                                halaman otomatis.
                            </p>
                        </div>

                        <div
                            class="p-4 rounded-xl border border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02] space-y-1.5"
                        >
                            <div
                                class="flex items-center gap-2 font-semibold text-xs text-gray-900 dark:text-gray-100"
                            >
                                <CheckCircle2 class="h-4 w-4 text-brand-500" />
                                Pencarian Debounced
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Pencarian instan berdasarkan nama atau email dengan delay debounce
                                300ms.
                            </p>
                        </div>

                        <div
                            class="p-4 rounded-xl border border-gray-100 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02] space-y-1.5"
                        >
                            <div
                                class="flex items-center gap-2 font-semibold text-xs text-gray-900 dark:text-gray-100"
                            >
                                <CheckCircle2 class="h-4 w-4 text-brand-500" />
                                VeeValidate + Zod
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Validasi skema lengkap dengan penanganan pesan error inline dan
                                banner status responsif.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Telemetry / Activity Log -->
            <Card>
                <CardHeader class="p-6 pb-4">
                    <div class="flex items-center justify-between">
                        <CardTitle class="text-lg font-bold text-foreground"
                            >Aktivitas Sistem</CardTitle
                        >
                        <Badge variant="success" class="h-5 px-2 text-[10px] font-semibold">
                            <span class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            Live
                        </Badge>
                    </div>
                    <CardDescription class="text-xs mt-1">
                        Log telemetri kontrol keamanan backend & frontend.
                    </CardDescription>
                </CardHeader>
                <CardContent class="p-6 pt-0">
                    <div class="space-y-4">
                        <div
                            v-for="log in recentEvents"
                            :key="log.id"
                            class="flex flex-col space-y-1.5 pb-3.5 border-b border-border/60 last:border-0 last:pb-0"
                        >
                            <div class="flex items-center justify-between text-xs">
                                <span class="font-semibold text-foreground">{{ log.event }}</span>
                                <span
                                    class="text-[11px] text-muted-foreground flex items-center gap-1"
                                >
                                    <Clock class="h-3 w-3" />
                                    {{ log.time }}
                                </span>
                            </div>
                            <p class="text-xs text-muted-foreground leading-relaxed">
                                {{ log.detail }}
                            </p>
                            <div>
                                <Badge
                                    variant="secondary"
                                    class="text-[10px] py-0.5 px-2.5 font-mono"
                                >
                                    {{ log.status }}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</template>
