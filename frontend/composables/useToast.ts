import { useNotificationStore } from '~/stores/notifications'

export const useToast = () => {
    const store = useNotificationStore()

    const success = (message: string, title?: string, timeout?: number) => {
        return store.addNotification({ message, title, type: 'success', timeout })
    }

    const error = (message: string, title?: string, timeout?: number) => {
        return store.addNotification({ message, title, type: 'error', timeout })
    }

    const warning = (message: string, title?: string, timeout?: number) => {
        return store.addNotification({ message, title, type: 'warning', timeout })
    }

    const info = (message: string, title?: string, timeout?: number) => {
        return store.addNotification({ message, title, type: 'info', timeout })
    }

    const confirm = (payload: { message: string, title: string, actionLabel: string, onAction: () => void }) => {
        return store.addNotification({
            ...payload,
            type: 'warning',
            timeout: 0 // Sticky until action or manual close
        })
    }

    const remove = (id: string) => {
        store.removeNotification(id)
    }

    return {
        success,
        error,
        warning,
        info,
        confirm,
        remove
    }
}
