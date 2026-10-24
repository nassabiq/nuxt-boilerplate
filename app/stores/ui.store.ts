import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const isSidebarExpanded = ref(true)
    const isSidebarMobileOpen = ref(false)
    const isSidebarHovered = ref(false)

    function toggleSidebar(): void {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
            isSidebarMobileOpen.value = !isSidebarMobileOpen.value
        } else {
            isSidebarExpanded.value = !isSidebarExpanded.value
        }
    }

    function toggleMobileSidebar(): void {
        isSidebarMobileOpen.value = !isSidebarMobileOpen.value
    }

    function closeMobileSidebar(): void {
        isSidebarMobileOpen.value = false
    }

    function setHovered(val: boolean): void {
        isSidebarHovered.value = val
    }

    function setExpanded(val: boolean): void {
        isSidebarExpanded.value = val
    }

    return {
        isSidebarExpanded,
        isSidebarMobileOpen,
        isSidebarHovered,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
        setHovered,
        setExpanded
    }
})
