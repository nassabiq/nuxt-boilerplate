<script setup lang="ts">
import { PaginationPrev, type PaginationPrevProps } from 'radix-vue'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const props = defineProps<PaginationPrevProps>()
</script>

<template>
    <PaginationPrev v-bind="props" as-child>
        <Button variant="outline" size="icon" class="h-8 w-8">
            <ChevronLeft class="h-4 w-4" />
        </Button>
    </PaginationPrev>
</template>
