<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import {
    createUserSchema,
    updateUserSchema,
    toCreateUserPayload,
    toUpdateUserPayload,
    type CreateUserFormValues,
    type UpdateUserFormValues
} from '../schemas/user.schema'
import type { User } from '~~/shared/types/user.types'
import { UserStatus, USER_STATUS_LABELS } from '~~/shared/types/user.types'
import { createUser, updateUser } from '../services/users.service'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem
} from '~/components/ui/select'
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-vue-next'
import { ConflictError, ApiError, ValidationError } from '~/lib/api/errors'

const props = defineProps<{
    open: boolean
    user?: User | null
}>()

const emits = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'saved', user: User): void
    (e: 'reloadRequired'): void
}>()

const conflictError = ref(false)
const generalError = ref<string | null>(null)
const isSubmitting = ref(false)

const isEditMode = computed(() => !!props.user)

const validationSchema = computed(() =>
    toTypedSchema(isEditMode.value ? updateUserSchema : createUserSchema)
)

const { handleSubmit, resetForm, setValues, setFieldError } = useForm({
    validationSchema
})

const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: statusId, errorMessage: statusError } = useField<number>('status_id')

const selectedStatus = computed({
    get: () =>
        statusId.value !== undefined && statusId.value !== null ? String(statusId.value) : '',
    set: (val: string) => {
        statusId.value = Number(val)
    }
})

watch(
    () => props.open,
    isOpen => {
        if (isOpen) {
            conflictError.value = false
            generalError.value = null
            if (props.user) {
                setValues({
                    name: props.user.name,
                    email: props.user.email,
                    status_id: props.user.status_id,
                    version: props.user.version
                })
            } else {
                resetForm({
                    values: {
                        name: '',
                        email: '',
                        password: '',
                        status_id: UserStatus.ACTIVE,
                        version: 1
                    }
                })
            }
        }
    }
)

// Watch user prop to reload form when conflict resolution updates it
watch(
    () => props.user,
    freshUser => {
        if (freshUser && props.open) {
            conflictError.value = false
            generalError.value = null
            setValues({
                name: freshUser.name,
                email: freshUser.email,
                status_id: freshUser.status_id,
                version: freshUser.version
            })
        }
    },
    { deep: true }
)

const onSubmit = handleSubmit(
    async values => {
        isSubmitting.value = true
        conflictError.value = false
        generalError.value = null

        try {
            if (isEditMode.value && props.user) {
                const payload = toUpdateUserPayload(
                    values as UpdateUserFormValues,
                    props.user.version
                )
                const updated = await updateUser(props.user.id, payload)
                emits('saved', updated)
                emits('update:open', false)
            } else {
                const payload = toCreateUserPayload(values as CreateUserFormValues)
                const created = await createUser(payload)
                emits('saved', created)
                emits('update:open', false)
            }
        } catch (err) {
            if (err instanceof ConflictError) {
                conflictError.value = true
            } else if (err instanceof ValidationError) {
                if (err.errors && err.errors.length > 0) {
                    const unmapped: string[] = []
                    for (const item of err.errors) {
                        if (item.field === 'name') {
                            setFieldError('name', item.message)
                        } else if (item.field === 'email') {
                            setFieldError('email', item.message)
                        } else if (item.field === 'password') {
                            setFieldError('password', item.message)
                        } else if (item.field === 'status_id' || item.field === 'status') {
                            setFieldError('status_id', item.message)
                        } else {
                            unmapped.push(`${item.field}: ${item.message}`)
                        }
                    }
                    if (unmapped.length > 0) {
                        generalError.value = unmapped.join(' | ')
                    }
                } else if (err.code === 'E_VAL_1') {
                    generalError.value =
                        'Password must contain at least 8 characters with uppercase, lowercase, number, and special character.'
                } else {
                    generalError.value = err.message
                }
            } else if (err instanceof ApiError) {
                generalError.value = err.message
            } else {
                generalError.value = 'An error occurred while saving user'
            }
        } finally {
            isSubmitting.value = false
        }
    },
    validationErrors => {
        console.warn('Form validation failed:', validationErrors)
        generalError.value = 'Mohon periksa kembali isian form yang belum sesuai.'
    }
)
</script>

<template>
    <Dialog :open="open" @update:open="emits('update:open', $event)">
        <DialogContent class="sm:max-w-md p-6">
            <DialogHeader class="space-y-1.5 pb-2">
                <DialogTitle class="text-xl font-bold tracking-tight text-foreground">
                    {{ isEditMode ? 'Edit User' : 'Add New User' }}
                </DialogTitle>
                <DialogDescription class="text-xs text-muted-foreground">
                    {{
                        isEditMode
                            ? 'Update user profile and account status.'
                            : 'Fill in the information to create a new user.'
                    }}
                </DialogDescription>
            </DialogHeader>

            <!-- Optimistic Locking Conflict Warning Banner -->
            <div
                v-if="conflictError"
                class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200"
            >
                <div class="flex items-start gap-3">
                    <AlertCircle
                        class="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    />
                    <div class="space-y-2">
                        <p class="font-semibold">Version Conflict Detected (HTTP 409)</p>
                        <p class="text-xs opacity-90">
                            This record has been modified by another session since you loaded it. To
                            protect data integrity, please reload the latest record before updating.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            class="gap-1.5 h-8 text-xs border-amber-500/40 hover:bg-amber-500/20 rounded-lg"
                            @click="emits('reloadRequired')"
                        >
                            <RefreshCw class="h-3.5 w-3.5" />
                            Reload Latest Data
                        </Button>
                    </div>
                </div>
            </div>

            <!-- General Error Banner -->
            <div
                v-if="generalError"
                class="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2"
            >
                <AlertCircle class="h-4 w-4 shrink-0" />
                <span>{{ generalError }}</span>
            </div>

            <form class="space-y-5 pt-1" @submit.prevent="onSubmit">
                <!-- Name Field -->
                <div>
                    <Label for="name">Full Name</Label>
                    <Input
                        id="name"
                        v-model="name"
                        placeholder="John Doe"
                        :class="{ 'border-destructive': nameError }"
                    />
                    <span v-if="nameError" class="mt-1.5 block text-xs text-destructive">{{
                        nameError
                    }}</span>
                </div>

                <!-- Email Field -->
                <div>
                    <Label for="email">Email Address</Label>
                    <Input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="john@example.com"
                        :class="{ 'border-destructive': emailError }"
                    />
                    <span v-if="emailError" class="mt-1.5 block text-xs text-destructive">{{
                        emailError
                    }}</span>
                </div>

                <!-- Password Field (Create Mode only) -->
                <div v-if="!isEditMode">
                    <Label for="password">Initial Password</Label>
                    <Input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="Min. 8 chars (upper, lower, number, special)"
                        :class="{ 'border-destructive': passwordError }"
                    />
                    <p class="mt-1 text-[11px] text-muted-foreground">
                        Min. 8 chars, uppercase, lowercase, number, and special character.
                    </p>
                    <span v-if="passwordError" class="mt-1.5 block text-xs text-destructive">{{
                        passwordError
                    }}</span>
                </div>

                <!-- Status Field (Edit Mode only) -->
                <div v-if="isEditMode">
                    <Label for="status">Account Status</Label>
                    <Select v-model="selectedStatus">
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="(label, key) in USER_STATUS_LABELS"
                                :key="key"
                                :value="String(key)"
                            >
                                {{ label }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <span v-if="statusError" class="mt-1.5 block text-xs text-destructive">{{
                        statusError
                    }}</span>
                </div>

                <DialogFooter class="pt-3 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        class="rounded-lg"
                        @click="emits('update:open', false)"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        class="rounded-lg shadow-xs"
                        :disabled="isSubmitting || conflictError"
                    >
                        <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                        {{ isEditMode ? 'Save Changes' : 'Create User' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
