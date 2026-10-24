<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'

interface BreadcrumbProps {
    pageTitle: string
}

defineProps<BreadcrumbProps>()
</script>

<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 class="text-2xl font-bold tracking-tight text-foreground">
            {{ pageTitle }}
        </h2>
        <nav aria-label="Breadcrumb">
            <ol class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <li>
                    <NuxtLink
                        to="/dashboard"
                        class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Home
                        <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/60" />
                    </NuxtLink>
                </li>
                <li class="font-semibold text-foreground">
                    {{ pageTitle }}
                </li>
            </ol>
        </nav>
    </div>
</template>
