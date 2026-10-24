<script setup lang="ts">
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import { Toaster } from '~/components/ui/toast'
</script>

<template>
    <div
        class="min-h-screen flex flex-col justify-between bg-muted/20 text-foreground antialiased font-sans selection:bg-primary/20"
    >
        <header class="flex justify-between items-center p-6 max-w-6xl w-full mx-auto">
            <NuxtLink to="/" class="flex items-center space-x-3 font-bold tracking-tight text-lg">
                <span
                    class="inline-block h-10 w-10 rounded-xl bg-primary text-primary-foreground text-center leading-10 font-mono text-sm font-bold shadow-xs"
                    >N</span
                >
                <span>NuxtBoilerplate</span>
            </NuxtLink>
            <ThemeToggle />
        </header>

        <main class="flex-1 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <slot />
            </div>
        </main>

        <footer class="p-6 text-center text-xs text-muted-foreground border-t border-border/40">
            Autentikasi enterprise aman dengan cookie sesi HttpOnly & arsitektur BFF Go Chi.
        </footer>

        <Toaster />
    </div>
</template>
