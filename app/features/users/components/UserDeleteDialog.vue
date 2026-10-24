<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '~~/shared/types/user.types'
import { deleteUser } from '../services/users.service'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
    open: boolean
    user: User | null
}>()

const emits = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'deleted', id: number): void
}>()

const isDeleting = ref(false)

async function confirmDelete() {
    if (!props.user) return
    isDeleting.value = true
    try {
        await deleteUser(props.user.id)
        emits('deleted', props.user.id)
        emits('update:open', false)
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
    <Dialog :open="open" @update:open="emits('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <div class="flex items-center gap-2 text-destructive mb-1">
                    <AlertTriangle class="h-5 w-5" />
                    <DialogTitle>Delete User</DialogTitle>
                </div>
                <DialogDescription>
                    Are you sure you want to delete
                    <span class="font-semibold text-foreground">{{ user?.name }}</span
                    >? This will soft delete the account.
                </DialogDescription>
            </DialogHeader>

            <DialogFooter class="pt-4">
                <Button variant="outline" @click="emits('update:open', false)"> Cancel </Button>
                <Button variant="destructive" :disabled="isDeleting" @click="confirmDelete">
                    <Loader2 v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
                    Delete
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
