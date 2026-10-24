<script setup lang="ts">
import { PaginationNext, type PaginationNextProps } from 'radix-vue'
import { ChevronRight } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const props = defineProps<PaginationNextProps>()
</script>

<template>
    <PaginationNext v-bind="props" as-child>
        <Button variant="outline" size="icon" class="h-8 w-8">
            <ChevronRight class="h-4 w-4" />
        </Button>
    </PaginationNext>
</template>
