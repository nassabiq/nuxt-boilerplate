import { useAuthStore } from '~/stores/auth.store'

export default defineNuxtRouteMiddleware(async () => {
    const auth = useAuthStore()

    if (!auth.isHydrated) {
        await auth.fetchMe()
    }

    if (auth.isAuthenticated) {
        return navigateTo('/dashboard')
    }
})
