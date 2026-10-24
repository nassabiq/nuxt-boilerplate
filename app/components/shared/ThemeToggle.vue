<template>
    <button
        type="button"
        class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full h-10 w-10 sm:h-11 sm:w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer shadow-2xs"
        aria-label="Toggle theme"
        @click.prevent="toggleTheme"
    >
        <Sun v-if="isDark" class="h-5 w-5 text-current" />
        <Moon v-else class="h-5 w-5 text-current" />
    </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = ref(false)

function toggleTheme() {
    isDark.value = !isDark.value
    if (isDark.value) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
    } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
    }
}

onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') {
        isDark.value = true
        document.documentElement.classList.add('dark')
    } else if (saved === 'light') {
        isDark.value = false
        document.documentElement.classList.remove('dark')
    } else {
        // Default to light like gpci-cms
        isDark.value = false
        document.documentElement.classList.remove('dark')
    }
})
</script>
