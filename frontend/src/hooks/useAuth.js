// hooks/useAuth.js — Convenience hook wrapping the auth store
import useAuthStore from '../store/authStore'
import { authService } from '../services/auth'
import { firebaseLogout } from '../services/firebase'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function useAuth() {
  const store    = useAuthStore()
  const navigate = useNavigate()

  const signOut = async () => {
    try {
      await authService.logout()
    } catch (_) {}
    try {
      await firebaseLogout()
    } catch (_) {}
    store.logout()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return {
    ...store,
    signOut,
  }
}
