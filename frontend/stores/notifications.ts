import { defineStore } from 'pinia'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
    id: string
    title?: string
    message: string
    type: NotificationType
    timeout: number
    onAction?: () => void
    actionLabel?: string
}

export const useNotificationStore = defineStore('notifications', {
    state: () => ({
        notifications: [] as Notification[]
    }),
    actions: {
        addNotification(payload: {
            message: string,
            title?: string,
            type?: NotificationType,
            timeout?: number,
            onAction?: () => void,
            actionLabel?: string
        }) {
            const id = Math.random().toString(36).substring(2, 9)
            const { message, title, type = 'info', timeout = 5000, onAction, actionLabel } = payload
            const notification: Notification = { id, message, title, type, timeout, onAction, actionLabel }

            this.notifications.push(notification)

            if (timeout > 0) {
                setTimeout(() => {
                    this.removeNotification(id)
                }, timeout)
            }

            return id
        },
        removeNotification(id: string) {
            const index = this.notifications.findIndex(n => n.id === id)
            if (index !== -1) {
                this.notifications.splice(index, 1)
            }
        }
    }
})
