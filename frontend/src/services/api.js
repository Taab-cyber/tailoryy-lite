// api.js — Axios instance with auth headers and error interceptors
import axios from 'axios'
import useAuthStore from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,   // 30s — accounts for serverless cold starts
  headers: { 'Content-Type': 'application/json' },
})

// Warm up the backend on app load (fire-and-forget)
axios.get(`${BASE_URL}/health`, { timeout: 5000 }).catch(() => {})

// Attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 — clear auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = window.location.pathname === '/login' || window.location.pathname === '/register'
      if (!isAuthRoute) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    // Normalise error message
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default api
