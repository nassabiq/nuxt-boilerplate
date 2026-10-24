<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
    class?: HTMLAttributes['class']
}>()
</script>

<template>
    <div
        :class="
            cn(
                'rounded-xl border border-gray-200 bg-card dark:border-gray-800 dark:bg-white/[0.03] text-gray-900 dark:text-gray-100 shadow-xs transition-shadow duration-200',
                props.class
            )
        "
    >
        <slot />
    </div>
</template>
