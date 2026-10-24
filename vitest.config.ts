import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/unit/**/*.{test,spec}.ts'],
        alias: {
            '~~/shared': fileURLToPath(new URL('./shared', import.meta.url)),
            '~/shared': fileURLToPath(new URL('./shared', import.meta.url)),
            '~/server': fileURLToPath(new URL('./server', import.meta.url)),
            '~': fileURLToPath(new URL('./app', import.meta.url)),
            '@': fileURLToPath(new URL('./app', import.meta.url))
        }
    }
})
