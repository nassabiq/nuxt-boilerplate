<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import { Button } from '~/components/ui/button'
import { Toaster } from '~/components/ui/toast'

const auth = useAuthStore()
</script>

<template>
    <div
        class="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans selection:bg-primary/20"
    >
        <!-- Public Header -->
        <header
            class="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md"
        >
            <div
                class="container mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6"
            >
                <div class="flex items-center gap-8">
                    <NuxtLink
                        to="/"
                        class="flex items-center space-x-3 font-bold tracking-tight text-lg"
                    >
                        <span
                            class="inline-block h-10 w-10 rounded-xl bg-primary text-primary-foreground text-center leading-10 font-mono text-sm font-bold shadow-xs"
                            >N</span
                        >
                        <span>NuxtBoilerplate</span>
                    </NuxtLink>
                    <nav
                        class="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground"
                    >
                        <NuxtLink to="/" class="transition-colors hover:text-foreground"
                            >Beranda</NuxtLink
                        >
                        <NuxtLink to="/dashboard" class="transition-colors hover:text-foreground"
                            >Dashboard</NuxtLink
                        >
                        <NuxtLink
                            to="/dashboard/users"
                            class="transition-colors hover:text-foreground"
                            >Fitur Pengguna</NuxtLink
                        >
                    </nav>
                </div>

                <div class="flex items-center gap-3">
                    <ThemeToggle />
                    <NuxtLink v-if="!auth.isAuthenticated" to="/login">
                        <Button size="sm" class="rounded-xl shadow-xs">Masuk</Button>
                    </NuxtLink>
                    <NuxtLink v-else to="/dashboard">
                        <Button size="sm" variant="outline" class="rounded-xl shadow-2xs"
                            >Buka Dashboard</Button
                        >
                    </NuxtLink>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1">
            <slot />
        </main>

        <!-- Public Footer -->
        <footer class="border-t border-border/60 py-8 bg-muted/20">
            <div
                class="container mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 px-4 sm:flex-row text-xs text-muted-foreground"
            >
                <p>© 2026 NuxtBoilerplate. Desain TailAdmin Vue Pro & Arsitektur Go Chi BFF.</p>
                <p class="font-mono">Bun 1.3 • Vitest • Playwright</p>
            </div>
        </footer>

        <Toaster />
    </div>
</template>
