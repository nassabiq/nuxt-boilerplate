import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiStore } from '../../app/stores/ui.store'

describe('UI Pinia Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('initializes with default sidebar expanded', () => {
        const store = useUiStore()
        expect(store.isSidebarExpanded).toBe(true)
        expect(store.isSidebarMobileOpen).toBe(false)
        expect(store.isSidebarHovered).toBe(false)
    })

    it('toggles desktop sidebar expanded state', () => {
        const store = useUiStore()
        store.toggleSidebar()
        expect(store.isSidebarExpanded).toBe(false)
        store.toggleSidebar()
        expect(store.isSidebarExpanded).toBe(true)
    })

    it('toggles and closes mobile sidebar', () => {
        const store = useUiStore()
        store.toggleMobileSidebar()
        expect(store.isSidebarMobileOpen).toBe(true)

        store.closeMobileSidebar()
        expect(store.isSidebarMobileOpen).toBe(false)
    })

    it('sets hovered and expanded states directly', () => {
        const store = useUiStore()
        store.setHovered(true)
        expect(store.isSidebarHovered).toBe(true)

        store.setExpanded(false)
        expect(store.isSidebarExpanded).toBe(false)
    })
})
