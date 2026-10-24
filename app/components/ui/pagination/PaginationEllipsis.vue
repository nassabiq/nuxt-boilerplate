<script setup lang="ts">
import { PaginationEllipsis, type PaginationEllipsisProps } from 'radix-vue'
import { MoreHorizontal } from 'lucide-vue-next'

const props = defineProps<PaginationEllipsisProps>()
</script>

<template>
    <PaginationEllipsis v-bind="props" class="flex h-9 w-9 items-center justify-center">
        <MoreHorizontal class="h-4 w-4" />
    </PaginationEllipsis>
</template>
