<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SelectIcon, SelectTrigger, type SelectTriggerProps, useForwardProps } from 'radix-vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '~/lib/utils'

const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes['class'] }>()
const forwarded = useForwardProps(props)
</script>

<template>
    <SelectTrigger
        v-bind="forwarded"
        :class="
            cn(
                'flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-colors',
                props.class
            )
        "
    >
        <slot />
        <SelectIcon as-child>
            <ChevronDown class="h-4 w-4 opacity-50 text-gray-400" />
        </SelectIcon>
    </SelectTrigger>
</template>
