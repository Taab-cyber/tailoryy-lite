// ChatFAB.jsx — Floating "Chat with us" button above Tawk.to widget
import React from 'react'
import { MessageCircle } from 'lucide-react'
import useTawk from '../hooks/useTawk'

export default function ChatFAB() {
  const { openChat, isOnline } = useTawk()

  return (
    <button
      onClick={openChat}
      aria-label="Chat with us"
      className="
        fixed bottom-24 left-5 z-30
        flex items-center gap-2
        bg-espresso text-ivory
        pl-3 pr-4 py-2.5 rounded-full
        shadow-hover hover:bg-terracotta
        transition-all duration-200
        text-sm font-sans font-medium
        group
      "
    >
      <MessageCircle size={18} className="flex-shrink-0" />
      <span className="hidden sm:inline">Chat with us</span>
      {/* Online indicator dot */}
      {isOnline && (
        <span className="w-2 h-2 rounded-full bg-success inline-block flex-shrink-0" aria-hidden />
      )}
    </button>
  )
}
