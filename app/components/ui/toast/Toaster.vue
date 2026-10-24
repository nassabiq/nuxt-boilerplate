<script setup lang="ts">
import { useToast } from './useToast'
import { X, CheckCircle2, AlertCircle } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const { toasts, dismiss } = useToast()
</script>

<template>
    <div
        class="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] pointer-events-none gap-2"
    >
        <div
            v-for="item in toasts"
            :key="item.id"
            :class="
                cn(
                    'pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 shadow-lg transition-all',
                    item.variant === 'destructive' &&
                        'border-destructive bg-destructive text-destructive-foreground',
                    item.variant === 'success' &&
                        'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
                    (!item.variant || item.variant === 'default') &&
                        'border bg-background text-foreground'
                )
            "
        >
            <div class="flex items-start gap-3">
                <CheckCircle2
                    v-if="item.variant === 'success'"
                    class="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0"
                />
                <AlertCircle v-else-if="item.variant === 'destructive'" class="h-5 w-5 shrink-0" />
                <div class="grid gap-1">
                    <div v-if="item.title" class="text-sm font-semibold">
                        {{ item.title }}
                    </div>
                    <div v-if="item.description" class="text-sm opacity-90">
                        {{ item.description }}
                    </div>
                </div>
            </div>
            <button
                class="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none group-hover:opacity-100"
                @click="dismiss(item.id)"
            >
                <X class="h-4 w-4" />
            </button>
        </div>
    </div>
</template>
