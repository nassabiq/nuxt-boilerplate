<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useAuthStore } from '~/stores/auth.store'
import { loginSchema } from '~/features/auth/schemas/auth.schema'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '~/components/ui/card'
import { useToast } from '~/components/ui/toast'
import { AlertCircle, Loader2, KeyRound } from 'lucide-vue-next'
import { ApiError, ValidationError } from '~/lib/api/errors'

definePageMeta({
    layout: 'auth',
    middleware: 'guest'
})

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { toast } = useToast()

const serverError = ref<string | null>(null)

const validationSchema = toTypedSchema(loginSchema)

const { handleSubmit, isSubmitting, setValues, setFieldError } = useForm({
    validationSchema,
    initialValues: {
        email: 'admin@example.com',
        password: 'password123'
    }
})

const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

function fillDemoCredentials() {
    setValues({
        email: 'admin@example.com',
        password: 'password123'
    })
}

const onSubmit = handleSubmit(async values => {
    serverError.value = null
    try {
        await auth.login(values.email, values.password)
        toast({
            title: 'Selamat datang kembali!',
            description: 'Berhasil masuk ke sistem portal admin.',
            variant: 'success'
        })
        const redirectPath = (route.query.redirect as string) || '/dashboard'
        router.push(redirectPath)
    } catch (err) {
        if (err instanceof ValidationError && err.errors?.length) {
            for (const item of err.errors) {
                if (item.field === 'email') {
                    setFieldError('email', item.message)
                } else if (item.field === 'password') {
                    setFieldError('password', item.message)
                }
            }
            serverError.value = err.message
        } else if (err instanceof ApiError) {
            serverError.value = err.message
        } else {
            serverError.value = 'Gagal masuk. Periksa kembali email dan password Anda.'
        }
    }
})

onMounted(() => {
    if (route.query.expired === 'true') {
        serverError.value =
            'Sesi Anda telah berakhir atau refresh token gagal. Silakan masuk kembali.'
    }
})
</script>

<template>
    <Card
        class="shadow-lg border border-border/80 bg-card/95 backdrop-blur-md rounded-xl p-2 sm:p-4"
    >
        <CardHeader class="space-y-2 text-center pb-6">
            <div
                class="mx-auto h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-xs mb-2"
            >
                N
            </div>
            <CardTitle class="text-2xl font-bold tracking-tight text-foreground"
                >Masuk ke Portal</CardTitle
            >
            <CardDescription class="text-xs">
                Gunakan kredensial akun administrator Anda untuk masuk ke sistem.
            </CardDescription>
        </CardHeader>

        <form @submit.prevent="onSubmit">
            <CardContent class="space-y-4">
                <!-- Error Banner -->
                <div
                    v-if="serverError"
                    class="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20"
                >
                    <AlertCircle class="h-4 w-4 shrink-0" />
                    <span>{{ serverError }}</span>
                </div>

                <!-- Demo Credentials Helper Banner -->
                <div
                    class="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-accent/30 dark:bg-primary/10 text-xs"
                >
                    <div class="flex items-center gap-2 text-muted-foreground">
                        <KeyRound class="h-4 w-4 text-primary" />
                        <span
                            >Demo:
                            <code class="font-mono text-foreground font-semibold"
                                >admin@example.com</code
                            ></span
                        >
                    </div>
                    <button
                        type="button"
                        class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                        @click="fillDemoCredentials"
                    >
                        Isi Otomatis
                    </button>
                </div>

                <!-- Email Field -->
                <div>
                    <Label for="email">Alamat Email</Label>
                    <Input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="admin@example.com"
                        autocomplete="email"
                        :class="{ 'border-destructive focus-visible:ring-destructive': emailError }"
                    />
                    <span v-if="emailError" class="mt-1.5 block text-xs text-destructive">{{
                        emailError
                    }}</span>
                </div>

                <!-- Password Field -->
                <div>
                    <Label for="password">Kata Sandi</Label>
                    <Input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        :class="{
                            'border-destructive focus-visible:ring-destructive': passwordError
                        }"
                    />
                    <span v-if="passwordError" class="mt-1.5 block text-xs text-destructive">{{
                        passwordError
                    }}</span>
                </div>
            </CardContent>

            <CardFooter class="flex flex-col gap-3 pt-3">
                <Button
                    type="submit"
                    class="w-full h-10 gap-2 rounded-lg shadow-xs font-semibold"
                    :disabled="isSubmitting"
                    :aria-busy="isSubmitting"
                >
                    <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
                    <span>{{ isSubmitting ? 'Memverifikasi...' : 'Masuk Sekarang' }}</span>
                </Button>

                <p class="text-[11px] text-center text-muted-foreground">
                    Terproteksi oleh arsitektur BFF HttpOnly session cookies.
                </p>
            </CardFooter>
        </form>
    </Card>
</template>
