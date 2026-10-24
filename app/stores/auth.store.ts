import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    login as apiLogin,
    logout as apiLogout,
    getMe as apiGetMe
} from '~/features/auth/services/auth.service'
import type { User } from '~~/shared/types/user.types'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLoading = ref(false)
    const isHydrated = ref(false)

    const isAuthenticated = computed(() => !!user.value)

    function clearAuth(): void {
        user.value = null
        isHydrated.value = false
    }

    async function login(email: string, password: string): Promise<User> {
        isLoading.value = true
        try {
            const response = await apiLogin({ email, password })
            user.value = response.user
            isHydrated.value = true
            return response.user
        } finally {
            isLoading.value = false
        }
    }

    async function logout(): Promise<void> {
        isLoading.value = true
        try {
            await apiLogout()
        } finally {
            clearAuth()
            isLoading.value = false
        }
    }

    async function fetchMe(force = false): Promise<User | null> {
        if (!force && isHydrated.value && user.value) {
            return user.value
        }

        isLoading.value = true
        try {
            const fetched = await apiGetMe()
            user.value = fetched
            return fetched
        } catch {
            clearAuth()
            return null
        } finally {
            isHydrated.value = true
            isLoading.value = false
        }
    }

    async function handleSessionExpired(redirectPath?: string): Promise<void> {
        clearAuth()
        if (import.meta.client && typeof window !== 'undefined') {
            const current = redirectPath || window.location.pathname + window.location.search
            if (window.location.pathname !== '/login') {
                try {
                    await navigateTo({
                        path: '/login',
                        query: { redirect: current, expired: 'true' }
                    })
                } catch {
                    window.location.href = `/login?redirect=${encodeURIComponent(current)}&expired=true`
                }
            }
        }
    }

    return {
        user,
        isLoading,
        isHydrated,
        isAuthenticated,
        clearAuth,
        login,
        logout,
        fetchMe,
        handleSessionExpired
    }
})
