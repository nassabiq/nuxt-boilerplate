import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: ['@nuxt/fonts', '@nuxt/icon', '@nuxt/eslint', '@pinia/nuxt'],

    components: {
        dirs: [
            {
                path: '~/components',
                ignore: ['**/index.ts', '**/useToast.ts']
            }
        ]
    },

    css: ['~/assets/css/main.css'],

    vite: {
        plugins: [tailwindcss()]
    },

    routeRules: {
        '/': { prerender: true },
        '/login': { ssr: false },
        '/dashboard/**': { ssr: false }
    },

    runtimeConfig: {
        apiBaseUrl: process.env.NUXT_API_BASE_URL || 'http://localhost:8080',
        mockApi: (() => {
            const envVal = process.env.NUXT_MOCK_API ?? process.env.MOCK_API
            if (envVal === undefined) return true
            const s = String(envVal)
                .trim()
                .toLowerCase()
                .replace(/^["']|["']$/g, '')
            return s === 'true' || s === '1'
        })(),
        sessionPassword:
            process.env.NUXT_SESSION_PASSWORD || 'nuxt-boilerplate-session-secret-key-32chars-min!',
        backendBasicAuthUsername: process.env.NUXT_BACKEND_BASIC_AUTH_USERNAME || '',
        backendBasicAuthPassword: process.env.NUXT_BACKEND_BASIC_AUTH_PASSWORD || '',
        public: {
            apiBaseUrl: '/api'
        }
    },

    compatibilityDate: '2025-07-15',
    devtools: { enabled: true }
})
