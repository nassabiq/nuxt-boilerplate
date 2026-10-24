import { ref } from 'vue'

export interface ToastMessage {
    id: string
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    duration?: number
}

const toasts = ref<ToastMessage[]>([])

export function useToast() {
    function toast(msg: Omit<ToastMessage, 'id'>) {
        const id = Math.random().toString(36).slice(2, 9)
        const newToast: ToastMessage = {
            id,
            duration: 4000,
            ...msg
        }
        toasts.value.push(newToast)

        setTimeout(() => {
            dismiss(id)
        }, newToast.duration)

        return id
    }

    function dismiss(id: string) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return {
        toasts,
        toast,
        dismiss
    }
}
