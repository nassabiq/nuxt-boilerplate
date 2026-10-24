import { useAuthStore } from '~/stores/auth.store'

export default defineNuxtRouteMiddleware(async to => {
    const auth = useAuthStore()

    // Attempt session hydration if not already hydrated
    if (!auth.isHydrated) {
        await auth.fetchMe()
    }

    if (!auth.isAuthenticated) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath }
        })
    }
})
