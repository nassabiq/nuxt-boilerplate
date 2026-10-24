<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { Button } from '~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
    ShieldCheck,
    Zap,
    Server,
    Layers,
    ArrowRight,
    CheckCircle,
    GitBranch,
    Lock,
    Cpu
} from 'lucide-vue-next'

const auth = useAuthStore()

definePageMeta({
    layout: 'default'
})
</script>

<template>
    <div class="py-16 md:py-24 overflow-hidden font-sans">
        <!-- Hero Section -->
        <div class="container mx-auto max-w-5xl px-4 text-center">
            <!-- Top Pill -->
            <div
                class="inline-flex items-center gap-2 rounded-full border border-border/80 bg-accent/40 dark:bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-8 backdrop-blur-xs shadow-2xs"
            >
                <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>Nuxt 4 + Tailwind CSS 4 + TailAdmin Design System</span>
            </div>

            <!-- Main Headline -->
            <h1
                class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground max-w-4xl mx-auto leading-[1.15]"
            >
                Fondasi Frontend Enterprise untuk Web & SaaS Modern
            </h1>
            <p
                class="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mt-6 mb-10 leading-relaxed"
            >
                Dirancang untuk portal admin, aplikasi SaaS, dan dashboard operasional. Dilengkapi
                autentikasi sesi BFF HttpOnly, desain sistem TailAdmin, dan integrasi Go Chi REST
                API.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center justify-center gap-3.5 mb-16">
                <NuxtLink v-if="auth.isAuthenticated" to="/dashboard">
                    <Button size="lg" class="gap-2 rounded-xl shadow-sm">
                        Buka Dashboard
                        <ArrowRight class="h-4 w-4" />
                    </Button>
                </NuxtLink>
                <NuxtLink v-else to="/login">
                    <Button size="lg" class="gap-2 rounded-xl shadow-sm">
                        Masuk ke Demo
                        <ArrowRight class="h-4 w-4" />
                    </Button>
                </NuxtLink>
                <NuxtLink to="/dashboard/users">
                    <Button size="lg" variant="outline" class="gap-2 rounded-xl shadow-2xs">
                        Jelajahi Fitur Pengguna
                    </Button>
                </NuxtLink>
            </div>

            <!-- Trust & Stack Chips -->
            <div
                class="flex flex-wrap items-center justify-center gap-2 mb-20 text-xs text-muted-foreground"
            >
                <span class="font-semibold mr-1 text-foreground/80">Teknologi:</span>
                <Badge variant="secondary" class="font-mono px-3 py-1">Nuxt 4.3</Badge>
                <Badge variant="secondary" class="font-mono px-3 py-1">Vue 3.5</Badge>
                <Badge variant="secondary" class="font-mono px-3 py-1">Tailwind 4</Badge>
                <Badge variant="secondary" class="font-mono px-3 py-1">TailAdmin UI</Badge>
                <Badge variant="secondary" class="font-mono px-3 py-1">Bun 1.3</Badge>
                <Badge variant="secondary" class="font-mono px-3 py-1">Go Chi</Badge>
            </div>

            <!-- Core Architecture Pillars -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
                <Card class="hover:border-primary/40 hover:shadow-md transition-all duration-200">
                    <CardHeader class="p-6">
                        <div
                            class="h-12 w-12 rounded-2xl bg-accent/80 dark:bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-2xs"
                        >
                            <ShieldCheck class="h-6 w-6" />
                        </div>
                        <CardTitle class="text-base font-bold">BFF Session Auth</CardTitle>
                        <CardDescription class="text-xs mt-2 leading-relaxed">
                            HttpOnly SameSite sealed cookies melindungi token dari XSS. Nol token
                            raw di browser localStorage.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card class="hover:border-primary/40 hover:shadow-md transition-all duration-200">
                    <CardHeader class="p-6">
                        <div
                            class="h-12 w-12 rounded-2xl bg-accent/80 dark:bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-2xs"
                        >
                            <Zap class="h-6 w-6" />
                        </div>
                        <CardTitle class="text-base font-bold">Tailwind CSS 4</CardTitle>
                        <CardDescription class="text-xs mt-2 leading-relaxed">
                            Variabel `@theme` native, integrasi `@tailwindcss/vite`, dan desain
                            token adaptif TailAdmin.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card class="hover:border-primary/40 hover:shadow-md transition-all duration-200">
                    <CardHeader class="p-6">
                        <div
                            class="h-12 w-12 rounded-2xl bg-accent/80 dark:bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-2xs"
                        >
                            <Server class="h-6 w-6" />
                        </div>
                        <CardTitle class="text-base font-bold">Kontrak Go Chi</CardTitle>
                        <CardDescription class="text-xs mt-2 leading-relaxed">
                            Pagination skip/limit native, mutex refresh token per-tenant, dan
                            proteksi konkurensi HTTP 409.
                        </CardDescription>
                    </CardHeader>
                </Card>

                <Card class="hover:border-primary/40 hover:shadow-md transition-all duration-200">
                    <CardHeader class="p-6">
                        <div
                            class="h-12 w-12 rounded-2xl bg-accent/80 dark:bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-2xs"
                        >
                            <Layers class="h-6 w-6" />
                        </div>
                        <CardTitle class="text-base font-bold">Siap Produksi</CardTitle>
                        <CardDescription class="text-xs mt-2 leading-relaxed">
                            100% Bun lockfile, pengujian unit Vitest, cakupan Playwright E2E, dan
                            multi-stage Docker build.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>

            <!-- Architecture Showcase Banner -->
            <div
                class="mt-16 text-left p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-xs"
            >
                <div
                    class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                    <div class="space-y-2 max-w-xl">
                        <div
                            class="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider"
                        >
                            <Cpu class="h-4 w-4" />
                            <span>Arsitektur Full-Stack Enterprise</span>
                        </div>
                        <h2 class="text-xl font-bold tracking-tight text-foreground">
                            Integrasi Go Chi Terpusat dengan Keamanan Menyeluruh
                        </h2>
                        <p class="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Browser hanya berkomunikasi dengan Nuxt BFF menggunakan cookie SameSite.
                            Sisi server menyisipkan token bearer dan menangani rotasi silent refresh
                            secara otomatis tanpa tabrakan sesi.
                        </p>
                    </div>

                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto shrink-0 text-xs"
                    >
                        <div
                            class="flex items-center gap-2.5 p-3 rounded-xl bg-accent/30 dark:bg-primary/10 font-medium"
                        >
                            <CheckCircle class="h-4 w-4 text-primary shrink-0" />
                            <span>Proteksi Cookie CSRF</span>
                        </div>
                        <div
                            class="flex items-center gap-2.5 p-3 rounded-xl bg-accent/30 dark:bg-primary/10 font-medium"
                        >
                            <Lock class="h-4 w-4 text-primary shrink-0" />
                            <span>Mutex Rotasi Token</span>
                        </div>
                        <div
                            class="flex items-center gap-2.5 p-3 rounded-xl bg-accent/30 dark:bg-primary/10 font-medium"
                        >
                            <GitBranch class="h-4 w-4 text-primary shrink-0" />
                            <span>Konkurensi Optimistik</span>
                        </div>
                        <div
                            class="flex items-center gap-2.5 p-3 rounded-xl bg-accent/30 dark:bg-primary/10 font-medium"
                        >
                            <Server class="h-4 w-4 text-primary shrink-0" />
                            <span>Mode Mock Otomatis</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
