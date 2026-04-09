// AdminCustomers.jsx — Customer list with profile drawer
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, X, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'
import { formatDate, formatCurrency } from '../../utils/formatters'

export default function AdminCustomers() {
  const [search,    setSearch]    = useState('')
  const [selected,  setSelected]  = useState(null)
  const [msgText,   setMsgText]   = useState('')
  const [msgModal,  setMsgModal]  = useState(false)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn:  () => api.get('/users/?limit=100').then(r => r.data),
  })

  const { data: customerOrders = [] } = useQuery({
    queryKey: ['admin-customer-orders', selected?.id],
    queryFn:  () => api.get(`/orders/?limit=5`).then(r => r.data.filter(o => o.customer_id === selected.id)),
    enabled:  !!selected,
  })

  const sendMsg = useMutation({
    mutationFn: () => api.post(`/messages/conversations/${selected.id}/reply`, { content: msgText, message_type: 'text' }).then(r => r.data),
    onSuccess: () => { toast.success('Message sent'); setMsgText(''); setMsgModal(false) },
    onError:   (e) => toast.error(e.message),
  })

  const filtered = customers.filter(c =>
    !search || c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>Customers — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl text-espresso">Customers <span className="text-muted font-sans text-lg font-normal">({customers.length})</span></h1>
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="input-base pl-8 py-2 text-sm" />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-white border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream border-b border-border">
                <tr>
                  {['Customer', 'Email', 'Phone', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="p-3 text-left font-sans font-medium text-charcoal text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted font-sans">No customers found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-cream/40 cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.full_name} src={c.profile_picture} size="sm" />
                        <p className="font-sans font-medium text-espresso">{c.full_name}</p>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{c.email}</td>
                    <td className="p-3 text-muted">{c.phone || '—'}</td>
                    <td className="p-3 text-muted text-xs">{formatDate(c.created_at)}</td>
                    <td className="p-3">
                      <button onClick={e => { e.stopPropagation(); setSelected(c); setMsgModal(true) }}
                        className="text-xs text-terracotta hover:underline font-sans">Message</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Customer Drawer */}
      {selected && !msgModal && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-espresso/30" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-hover overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="font-serif text-lg text-espresso">Customer Profile</h3>
              <button onClick={() => setSelected(null)} className="text-muted hover:text-espresso"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={selected.full_name} src={selected.profile_picture} size="lg" />
                <div>
                  <p className="font-sans font-semibold text-espresso">{selected.full_name}</p>
                  <p className="text-sm text-muted">{selected.email}</p>
                  <p className="text-sm text-muted">{selected.phone}</p>
                </div>
              </div>
              <div className="text-xs text-muted font-sans">Joined {formatDate(selected.created_at)}</div>

              <div>
                <p className="font-sans font-medium text-espresso text-sm mb-2">Recent Orders</p>
                {customerOrders.length === 0 ? (
                  <p className="text-sm text-muted">No orders yet</p>
                ) : customerOrders.slice(0,5).map(o => (
                  <Link key={o.id} to={`/admin/orders/${o.id}`}
                    className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 hover:text-terracotta transition-colors">
                    <span className="font-mono text-xs text-charcoal">{o.order_number}</span>
                    <span className="text-xs text-muted">{formatCurrency(o.total_amount)}</span>
                  </Link>
                ))}
              </div>

              <Button onClick={() => setMsgModal(true)} className="w-full gap-2" variant="ghost">
                <Send size={14} /> Send Message
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <Modal isOpen={msgModal} onClose={() => setMsgModal(false)} title={`Message ${selected?.full_name}`} size="sm">
        <Textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4} placeholder="Type your message…" />
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" onClick={() => setMsgModal(false)} className="flex-1">Cancel</Button>
          <Button onClick={() => sendMsg.mutate()} loading={sendMsg.isPending} disabled={!msgText.trim()} className="flex-1">Send</Button>
        </div>
      </Modal>
    </div>
  )
}
