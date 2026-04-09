// authStore.js — Zustand store for authentication state
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      refreshToken:    null,
      isAuthenticated: false,

      login: (user, token, refreshToken) => {
        // Pre-fill Tawk.to with user info on login
        if (window.Tawk_API?.setAttributes) {
          window.Tawk_API.setAttributes({
            name:  user.full_name,
            email: user.email,
          })
        }
        set({ user, token, refreshToken, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      getToken: () => get().token,
    }),
    {
      name:    'tailoryy-auth',
      partialize: (state) => ({
        user:         state.user,
        token:        state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
