<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
    title: string
    desc?: string
    class?: HTMLAttributes['class']
}

defineProps<Props>()
</script>

<template>
    <div
        :class="
            cn(
                'rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]',
                $props.class
            )
        "
    >
        <!-- Card Header with Title and Actions slot -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:px-6 sm:py-5"
        >
            <div>
                <h3 class="text-lg font-medium text-gray-800 dark:text-white/90">
                    {{ title }}
                </h3>
                <p v-if="desc" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {{ desc }}
                </p>
            </div>

            <div v-if="$slots.actions" class="flex items-center gap-2">
                <slot name="actions" />
            </div>
        </div>

        <!-- Card Body with clean vertical spacing -->
        <div class="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800">
            <div class="space-y-5">
                <slot />
            </div>
        </div>
    </div>
</template>
