<script setup lang="ts">
import { PaginationList, type PaginationListProps } from 'radix-vue'

const props = defineProps<PaginationListProps>()
</script>

<template>
    <PaginationList v-bind="props" class="flex items-center gap-1">
        <template #default="slotProps">
            <slot v-bind="slotProps" />
        </template>
    </PaginationList>
</template>
