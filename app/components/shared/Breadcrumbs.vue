<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRight, Home } from 'lucide-vue-next'

const route = useRoute()

const breadcrumbs = computed(() => {
    const parts = route.path.split('/').filter(Boolean)
    let currentPath = ''
    return parts.map(part => {
        currentPath += `/${part}`
        const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
        return {
            label,
            path: currentPath
        }
    })
})
</script>

<template>
    <nav aria-label="Breadcrumb" class="flex items-center text-sm text-muted-foreground">
        <ol class="flex items-center space-x-1.5">
            <li>
                <NuxtLink
                    to="/dashboard"
                    class="flex items-center hover:text-foreground transition-colors"
                >
                    <Home class="h-3.5 w-3.5" />
                    <span class="sr-only">Dashboard</span>
                </NuxtLink>
            </li>
            <li
                v-for="(crumb, idx) in breadcrumbs"
                :key="crumb.path"
                class="flex items-center space-x-1.5"
            >
                <ChevronRight class="h-3.5 w-3.5 text-muted-foreground/60" />
                <NuxtLink
                    v-if="idx < breadcrumbs.length - 1"
                    :to="crumb.path"
                    class="hover:text-foreground transition-colors"
                >
                    {{ crumb.label }}
                </NuxtLink>
                <span v-else class="font-medium text-foreground">
                    {{ crumb.label }}
                </span>
            </li>
        </ol>
    </nav>
</template>
