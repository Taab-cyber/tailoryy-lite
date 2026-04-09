// Messages.jsx — Customer DM / chat page
import React, { useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { Send, MessageSquare } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import Skeleton from '../../components/ui/Skeleton'

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatMsgTime(dateStr) {
  if (!dateStr) return ''
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr)
    if (isToday(d))     return `Today ${format(d, 'h:mm a')}`
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
    return format(d, 'dd MMM yyyy, h:mm a')
  } catch {
    return ''
  }
}

// Group messages by date for dividers
function groupByDate(messages) {
  const groups = []
  let lastDate = null

  for (const msg of messages) {
    let dateLabel = ''
    try {
      const d = typeof msg.created_at === 'string' ? parseISO(msg.created_at) : new Date(msg.created_at)
      if (isToday(d))     dateLabel = 'Today'
      else if (isYesterday(d)) dateLabel = 'Yesterday'
      else                dateLabel = format(d, 'dd MMMM yyyy')
    } catch {
      dateLabel = ''
    }

    if (dateLabel !== lastDate) {
      groups.push({ type: 'divider', label: dateLabel, id: `divider-${msg.id}` })
      lastDate = dateLabel
    }
    groups.push({ type: 'message', ...msg })
  }

  return groups
}

// ─── empty illustration ───────────────────────────────────────────────────────

function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center select-none">
      {/* Simple CSS illustration — speech bubble lines */}
      <div className="relative w-24 h-20 mb-6" aria-hidden>
        <div className="absolute inset-0 rounded-2xl rounded-bl-none border-4 border-terracotta-light bg-white" />
        <div className="absolute top-4 left-4 right-4 space-y-2.5">
          <div className="h-2 bg-terracotta-light rounded-full" />
          <div className="h-2 bg-terracotta-light rounded-full w-2/3" />
          <div className="h-2 bg-terracotta-light rounded-full w-3/4" />
        </div>
        <div className="absolute -bottom-3 left-4 w-4 h-4 bg-white border-b-4 border-l-4 border-terracotta-light rounded-bl-lg" />
      </div>
      <h3 className="font-serif text-xl text-espresso mb-2">No messages yet</h3>
      <p className="text-muted font-sans text-sm max-w-xs">
        Send us a message! We usually reply within a few hours.
      </p>
    </div>
  )
}

// ─── message skeleton ─────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-hidden">
      {/* Admin message */}
      <div className="flex items-end gap-2">
        <Skeleton circle className="w-8 h-8 flex-shrink-0" />
        <div className="space-y-1.5 max-w-[70%]">
          <Skeleton className="h-10 w-48" rounded />
          <Skeleton className="h-3 w-20" rounded />
        </div>
      </div>
      {/* Customer message */}
      <div className="flex items-end gap-2 justify-end">
        <div className="space-y-1.5 max-w-[70%] items-end flex flex-col">
          <Skeleton className="h-14 w-56" rounded />
          <Skeleton className="h-3 w-24" rounded />
        </div>
      </div>
      {/* Admin message */}
      <div className="flex items-end gap-2">
        <Skeleton circle className="w-8 h-8 flex-shrink-0" />
        <div className="space-y-1.5 max-w-[70%]">
          <Skeleton className="h-8 w-36" rounded />
          <Skeleton className="h-3 w-16" rounded />
        </div>
      </div>
    </div>
  )
}

// ─── message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg, isOwn }) {
  if (isOwn) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 12, y: 4 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.18 }}
        className="flex flex-col items-end"
      >
        <div className="max-w-[75%] sm:max-w-[60%]">
          <div className="bg-terracotta text-white px-4 py-2.5 rounded-l-lg rounded-tr-lg shadow-sm">
            <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words">
              {msg.content || msg.message || msg.text}
            </p>
          </div>
          <p className="text-[11px] text-muted font-sans mt-1 text-right px-1">
            {formatMsgTime(msg.created_at)}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, y: 4 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex items-end gap-2"
    >
      {/* Tailoryy Team avatar */}
      <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0 mb-5 shadow-sm">
        <span className="text-white font-serif font-bold text-sm">T</span>
      </div>
      <div className="max-w-[75%] sm:max-w-[60%]">
        <p className="text-[10px] font-sans text-muted mb-1 ml-1">Tailoryy Team</p>
        <div className="bg-white text-espresso px-4 py-2.5 rounded-r-lg rounded-tl-lg shadow-sm border border-border">
          <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words">
            {msg.content || msg.message || msg.text}
          </p>
        </div>
        <p className="text-[11px] text-muted font-sans mt-1 ml-1">
          {formatMsgTime(msg.created_at)}
        </p>
      </div>
    </motion.div>
  )
}

// ─── input bar ────────────────────────────────────────────────────────────────

function InputBar({ onSend, isSending }) {
  const textareaRef = useRef(null)
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: { content: '' },
  })

  const content = watch('content')

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [content])

  const doSend = (data) => {
    if (!data.content.trim()) return
    onSend(data.content.trim())
    reset()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(doSend)()
    }
  }

  const { ref: rhfRef, ...rhfRest } = register('content')

  return (
    <form
      onSubmit={handleSubmit(doSend)}
      className="flex items-end gap-2 p-3 border-t border-border bg-white"
    >
      <textarea
        ref={(el) => {
          rhfRef(el)
          textareaRef.current = el
        }}
        rows={1}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        className="
          flex-1 resize-none input-base py-2.5 text-sm leading-relaxed
          max-h-36 overflow-y-auto transition-all duration-150
        "
        onKeyDown={handleKeyDown}
        {...rhfRest}
      />
      <button
        type="submit"
        disabled={isSending || !content.trim()}
        className="
          w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center flex-shrink-0
          hover:bg-terracotta-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-95
        "
        aria-label="Send message"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const bottomRef = useRef(null)
  const listRef   = useRef(null)

  // Fetch conversation (polling every 15s)
  const { data: conversation, isLoading } = useQuery({
    queryKey: ['messages', 'conversation'],
    queryFn:  () => api.get('/messages/my-conversation').then((r) => r.data),
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  const messages = conversation?.messages ?? conversation?.results ?? []
  const unread   = conversation?.unread_count_customer ?? 0

  // Mark as read on load
  useEffect(() => {
    if (conversation) {
      api.put('/messages/my-conversation/read').catch(() => {})
    }
  }, [!!conversation])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom('instant')
  }, [isLoading])

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages.length])

  // Send message
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: (content) => api.post('/messages/', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation'] })
    },
    onError: (err) => toast.error(err.message || 'Could not send message'),
  })

  const grouped = groupByDate(messages)

  return (
    <>
      <Helmet>
        <title>
          {unread > 0 ? `(${unread}) Messages — Tailoryy` : 'Messages — Tailoryy'}
        </title>
      </Helmet>

      {/* Full-height layout */}
      <div
        className="flex flex-col bg-ivory"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-border shadow-sm">
          <div className="w-9 h-9 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
            <span className="text-white font-serif font-bold">T</span>
          </div>
          <div className="flex-1">
            <p className="font-sans font-semibold text-sm text-espresso">Tailoryy Team</p>
            <p className="text-xs text-muted font-sans">Usually replies within a few hours</p>
          </div>
          {unread > 0 && (
            <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unread} new
            </span>
          )}
        </div>

        {/* Messages area */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
        >
          {isLoading ? (
            <MessagesSkeleton />
          ) : messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <AnimatePresence initial={false}>
              {grouped.map((item) => {
                if (item.type === 'divider') {
                  return (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[11px] font-sans text-muted px-2 flex-shrink-0">
                        {item.label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )
                }

                // Determine if message is from the current user (customer)
                const isOwn =
                  item.sender_type === 'customer' ||
                  item.sender?.id === user?.id ||
                  item.sender === user?.id ||
                  item.is_from_customer === true

                return (
                  <MessageBubble
                    key={item.id}
                    msg={item}
                    isOwn={isOwn}
                  />
                )
              })}
            </AnimatePresence>
          )}
          {/* Scroll anchor */}
          <div ref={bottomRef} className="h-px" />
        </div>

        {/* Input bar */}
        <InputBar onSend={sendMessage} isSending={isSending} />
      </div>
    </>
  )
}
