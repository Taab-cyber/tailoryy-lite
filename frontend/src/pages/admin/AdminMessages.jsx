// AdminMessages.jsx — Two-panel DM inbox: conversation list + active thread
import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, ArrowLeft, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, isToday, isYesterday } from 'date-fns'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Avatar from '../../components/ui/Avatar'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import useAuthStore from '../../store/authStore'

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isToday(d))     return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'd MMM')
}

export default function AdminMessages() {
  const [activeCustomerId, setActiveCustomerId] = useState(null)
  const [reply,            setReply]            = useState('')
  const [showThread,       setShowThread]        = useState(false)
  const bottomRef = useRef(null)
  const { user }  = useAuthStore()
  const qc        = useQueryClient()

  const { data: conversations = [], isLoading: loadingList } = useQuery({
    queryKey:        ['admin-conversations'],
    queryFn:         () => api.get('/messages/conversations').then(r => r.data),
    refetchInterval: 10000,
  })

  const { data: thread } = useQuery({
    queryKey:        ['admin-thread', activeCustomerId],
    queryFn:         () => api.get(`/messages/conversations/${activeCustomerId}`).then(r => r.data),
    enabled:         !!activeCustomerId,
    refetchInterval: 10000,
  })

  const sendReply = useMutation({
    mutationFn: () => api.post(`/messages/conversations/${activeCustomerId}/reply`, { content: reply, message_type: 'text' }).then(r => r.data),
    onSuccess: () => {
      setReply('')
      qc.invalidateQueries({ queryKey: ['admin-thread', activeCustomerId] })
      qc.invalidateQueries({ queryKey: ['admin-conversations'] })
    },
    onError: (e) => toast.error(e.message),
  })

  const markRead = useMutation({
    mutationFn: (cid) => api.put(`/messages/conversations/${cid}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-conversations'] }),
  })

  const markAllRead = async () => {
    const unread = conversations.filter(c => c.conversation?.unread_count_admin > 0)
    await Promise.all(unread.map(c => markRead.mutateAsync(c.conversation.customer_id)))
    toast.success('All marked as read')
  }

  useEffect(() => {
    if (activeCustomerId) markRead.mutate(activeCustomerId)
  }, [activeCustomerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  const openConversation = (cid) => {
    setActiveCustomerId(cid)
    setShowThread(true)
  }

  const messages  = thread?.messages || []
  const customer  = thread?.customer
  const adminId   = user?.id

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Messages — Tailoryy Admin</title></Helmet>
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 flex overflow-hidden" style={{ height: '100vh' }}>
        {/* Left panel: conversation list */}
        <div className={`w-full lg:w-80 border-r border-border bg-white flex flex-col ${showThread ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-serif text-lg text-espresso">Messages</h2>
            <button onClick={markAllRead} className="text-xs text-terracotta hover:underline font-sans flex items-center gap-1">
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-muted text-sm py-10 font-sans">No conversations yet</p>
            ) : conversations.map(({ conversation: conv, customer: cust, last_message }) => {
              const unread = conv?.unread_count_admin > 0
              const isActive = conv?.customer_id === activeCustomerId
              return (
                <button
                  key={conv?.id}
                  onClick={() => openConversation(conv?.customer_id)}
                  className={`w-full flex items-start gap-3 p-4 border-b border-border/50 text-left transition-colors hover:bg-cream
                    ${isActive ? 'bg-terracotta-light/30' : ''}
                    ${unread ? 'border-l-2 border-l-terracotta' : ''}
                  `}
                >
                  <Avatar name={cust?.full_name} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm font-sans truncate ${unread ? 'font-semibold text-espresso' : 'text-charcoal'}`}>
                        {cust?.full_name || 'Customer'}
                      </p>
                      <span className="text-xs text-muted ml-2 flex-shrink-0">{formatTime(conv?.last_message_at)}</span>
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">{last_message || 'No messages yet'}</p>
                  </div>
                  {unread && (
                    <span className="w-2 h-2 bg-terracotta rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel: thread */}
        <div className={`flex-1 flex flex-col ${showThread ? 'flex' : 'hidden lg:flex'}`}>
          {!activeCustomerId ? (
            <div className="flex-1 flex items-center justify-center text-muted font-sans text-sm">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-white">
                <button onClick={() => setShowThread(false)} className="lg:hidden text-muted hover:text-espresso mr-1">
                  <ArrowLeft size={18} />
                </button>
                <Avatar name={customer?.full_name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-semibold text-espresso text-sm">{customer?.full_name}</p>
                  <p className="font-sans text-xs text-muted">{customer?.email}</p>
                </div>
                <Link to={`/admin/orders?customer=${activeCustomerId}`}
                  className="text-xs text-terracotta hover:underline font-sans">
                  View Orders
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-cream/30">
                {messages.length === 0 ? (
                  <p className="text-center text-muted text-sm py-10 font-sans">No messages yet</p>
                ) : messages.map(msg => {
                  const isAdmin = msg.sender_id === adminId
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-full bg-cream border border-border flex items-center justify-center text-xs font-bold text-charcoal flex-shrink-0">
                          {customer?.full_name?.[0] || 'C'}
                        </div>
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-lg font-sans text-sm leading-relaxed
                        ${isAdmin
                          ? 'bg-terracotta text-white rounded-br-sm'
                          : 'bg-white text-espresso border border-border rounded-bl-sm'
                        }`}>
                        {msg.content}
                        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/60' : 'text-muted'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply input */}
              <div className="px-5 py-4 bg-white border-t border-border flex items-end gap-3">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (reply.trim()) sendReply.mutate() } }}
                  placeholder="Type a reply… (Enter to send)"
                  rows={1}
                  className="input-base flex-1 resize-none py-2.5 text-sm"
                  style={{ minHeight: '42px', maxHeight: '120px', overflowY: 'auto' }}
                />
                <Button size="sm" onClick={() => sendReply.mutate()} loading={sendReply.isPending} disabled={!reply.trim()}>
                  <Send size={15} />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
