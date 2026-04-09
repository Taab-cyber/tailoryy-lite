// notificationStore.js — Zustand store for notification state
import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications:  [],
  unreadCount:    0,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.is_read).length
    set({ notifications, unreadCount: unread })
  },

  markRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },
}))

export default useNotificationStore
