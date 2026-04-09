// AdminOrderDetail.jsx — Full order view with status management, artisan, tracking, messaging
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANTS, SERVICE_LABELS } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/formatters'

const STATUS_STEPS = ['pending','confirmed','cutting','stitching','quality_check','shipped','delivered']

export default function AdminOrderDetail() {
  const { id } = useParams()
  const qc     = useQueryClient()
  const [msgOpen,   setMsgOpen]   = useState(false)
  const [msgText,   setMsgText]   = useState('')
  const [copied,    setCopied]    = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [artisan,   setArtisan]   = useState('')
  const [tracking,  setTracking]  = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [estDate,   setEstDate]   = useState('')

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn:  () => api.get(`/orders/${id}`).then(r => r.data),
    onSuccess: (o) => {
      setNewStatus(o.status)
      setArtisan(o.assigned_artisan || '')
      setTracking(o.tracking_number || '')
      setAdminNote(o.admin_notes || '')
      setEstDate(o.estimated_delivery ? o.estimated_delivery.split('T')[0] : '')
    },
  })

  const updateStatus = useMutation({
    mutationFn: (data) => api.put(`/orders/${id}/status`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-order', id] }); toast.success('Order updated') },
    onError: (e) => toast.error(e.message),
  })

  const updateArtisan  = useMutation({ mutationFn: () => api.put(`/orders/${id}/artisan`,  { artisan }).then(r => r.data),  onSuccess: () => toast.success('Artisan assigned') })
  const updateTracking = useMutation({ mutationFn: () => api.put(`/orders/${id}/tracking`, { tracking_number: tracking }).then(r => r.data), onSuccess: () => toast.success('Tracking updated') })

  const sendMessage = useMutation({
    mutationFn: () => api.post(`/messages/conversations/${order.customer_id}/reply`, { content: msgText, message_type: 'text' }).then(r => r.data),
    onSuccess: () => { toast.success('Message sent'); setMsgText(''); setMsgOpen(false) },
    onError: (e) => toast.error(e.message),
  })

  const copyTracking = () => {
    if (!order?.tracking_number) return
    navigator.clipboard.writeText(order.tracking_number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 flex items-center justify-center"><Spinner size="lg" /></main>
    </div>
  )
  if (!order) return null

  const stepIdx = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="flex min-h-screen bg-ivory">
      <Helmet><title>{order.order_number} — Tailoryy Admin</title></Helmet>
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6 max-w-5xl">
        <Link to="/admin/orders" className="inline-flex items-center gap-2 text-sm text-muted hover:text-terracotta mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-xs text-muted mb-1">{order.order_number}</p>
            <h1 className="font-serif text-2xl text-espresso">{SERVICE_LABELS[order.service_type]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            <Button size="sm" onClick={() => setMsgOpen(true)} className="gap-2">
              <Send size={13} /> Message Customer
            </Button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white border border-border rounded-md p-5 mb-5">
          <h3 className="font-serif text-base text-espresso mb-4">Order Progress</h3>
          <div className="flex items-center gap-0 overflow-x-auto pb-2">
            {STATUS_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    i < stepIdx  ? 'bg-success border-success text-white' :
                    i === stepIdx ? 'bg-terracotta border-terracotta text-white' :
                    'bg-cream border-border text-muted'
                  }`}>{i < stepIdx ? '✓' : i + 1}</div>
                  <p className="text-[10px] font-sans text-muted mt-1 text-center max-w-[60px] leading-tight">{ORDER_STATUS_LABELS[s]}</p>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < stepIdx ? 'bg-success' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Images */}
            {order.inspiration_images?.length > 0 && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-serif text-base text-espresso mb-3">Inspiration Images</h3>
                <div className="grid grid-cols-3 gap-3">
                  {order.inspiration_images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Inspiration ${i+1}`} className="w-full h-24 object-cover rounded-sm hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Measurements */}
            {Object.keys(order.measurements || {}).length > 0 && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-serif text-base text-espresso mb-3">Measurements</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {Object.entries(order.measurements).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted capitalize">{k.replace(/_/g,' ')}</span>
                      <span className="text-sm font-medium text-espresso">{v} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric & Colour */}
            {(order.fabric_preference || order.color_preference) && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-serif text-base text-espresso mb-3">Fabric & Colour</h3>
                {order.fabric_preference && <p className="text-sm text-charcoal mb-1"><span className="text-muted">Fabric: </span>{order.fabric_preference}</p>}
                {order.color_preference  && <p className="text-sm text-charcoal mb-1"><span className="text-muted">Colour: </span>{order.color_preference}</p>}
                {order.embellishments?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {order.embellishments.map(e => <span key={e} className="text-xs bg-cream px-2 py-1 rounded-full border border-border text-charcoal">{e}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {order.additional_notes && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-serif text-base text-espresso mb-2">Customer Notes</h3>
                <p className="text-sm text-charcoal leading-relaxed">{order.additional_notes}</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Update Status */}
            <div className="bg-white border border-border rounded-md p-5">
              <h3 className="font-serif text-base text-espresso mb-3">Update Order</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted font-sans block mb-1">Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-base text-sm py-2 w-full">
                    {STATUS_STEPS.concat(['cancelled']).map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted font-sans block mb-1">Est. Delivery</label>
                  <input type="date" value={estDate} onChange={e => setEstDate(e.target.value)} className="input-base text-sm py-2 w-full" />
                </div>
                <Textarea label="Admin Notes (private)" value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2} />
                <Button className="w-full" size="sm"
                  onClick={() => updateStatus.mutate({ status: newStatus, estimated_delivery: estDate, admin_notes: adminNote })}
                  loading={updateStatus.isPending}>
                  Save Changes
                </Button>
              </div>
            </div>

            {/* Artisan */}
            <div className="bg-white border border-border rounded-md p-5">
              <h3 className="font-serif text-base text-espresso mb-3">Assign Artisan</h3>
              <div className="flex gap-2">
                <input value={artisan} onChange={e => setArtisan(e.target.value)} placeholder="Artisan name" className="input-base text-sm py-2 flex-1" />
                <Button size="sm" onClick={() => updateArtisan.mutate()} loading={updateArtisan.isPending}>Save</Button>
              </div>
            </div>

            {/* Tracking */}
            <div className="bg-white border border-border rounded-md p-5">
              <h3 className="font-serif text-base text-espresso mb-3">Tracking</h3>
              <div className="flex gap-2 mb-2">
                <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="Tracking number" className="input-base text-sm py-2 flex-1" />
                <Button size="sm" onClick={() => updateTracking.mutate()} loading={updateTracking.isPending}>Save</Button>
              </div>
              {order.tracking_number && (
                <button onClick={copyTracking} className="text-xs text-terracotta flex items-center gap-1 hover:underline">
                  {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied!' : 'Copy tracking'}
                </button>
              )}
            </div>

            {/* Payment */}
            <div className="bg-white border border-border rounded-md p-5">
              <h3 className="font-serif text-base text-espresso mb-3">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-medium">{formatCurrency(order.total_amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted">Advance paid</span><span className="font-medium text-success">{formatCurrency(order.advance_paid)}</span></div>
                <div className="flex justify-between border-t border-border pt-2 mt-2"><span className="font-medium">Balance due</span><span className="font-bold text-terracotta">{formatCurrency(order.balance_due)}</span></div>
              </div>
            </div>

            {/* Shipping */}
            {order.shipping_address?.city && (
              <div className="bg-white border border-border rounded-md p-5">
                <h3 className="font-serif text-base text-espresso mb-2">Ship To</h3>
                <p className="text-sm text-charcoal leading-relaxed">
                  {order.shipping_address.name}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Send Message Modal */}
      <Modal isOpen={msgOpen} onClose={() => setMsgOpen(false)} title="Send Message to Customer" size="sm">
        <Textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4} placeholder="Type your message…" />
        <div className="flex gap-3 mt-4">
          <Button variant="ghost" onClick={() => setMsgOpen(false)} className="flex-1">Cancel</Button>
          <Button onClick={() => sendMessage.mutate()} loading={sendMessage.isPending} disabled={!msgText.trim()} className="flex-1">Send</Button>
        </div>
      </Modal>
    </div>
  )
}
