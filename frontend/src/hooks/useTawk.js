// useTawk.js — Hook exposing Tawk.to chat controls, handles load delays gracefully
import { useCallback, useEffect, useState } from 'react'

export default function useTawk() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // Poll for Tawk status every 3s until loaded
    const check = () => {
      if (window.Tawk_API) {
        try {
          setIsOnline(window.Tawk_API.getStatus?.() === 'online')
        } catch (_) {}
      }
    }
    check()
    const interval = setInterval(check, 3000)
    return () => clearInterval(interval)
  }, [])

  const openChat = useCallback(() => {
    if (window.Tawk_API?.maximize) {
      window.Tawk_API.maximize()
    } else {
      // Tawk not loaded yet — retry after short delay
      setTimeout(() => {
        window.Tawk_API?.maximize?.()
      }, 1500)
    }
  }, [])

  const closeChat = useCallback(() => {
    window.Tawk_API?.minimize?.()
  }, [])

  const setVisitorInfo = useCallback((name, email) => {
    if (window.Tawk_API?.setAttributes) {
      window.Tawk_API.setAttributes({ name, email })
    }
  }, [])

  return { openChat, closeChat, setVisitorInfo, isOnline }
}
