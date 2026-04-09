// OrderDetail.jsx — Full order detail page with timeline, gallery, review
import React, { useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Scissors,
  Truck,
  XCircle,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Star,
  X,
  MapPin,
  CreditCard,
  Package,
} from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Textarea from '../../components/ui/Textarea'

// ─── constants ───────────────────────────────────────────────────────────────

const STATUS_VARIANT = {
  pending:       'neutral',
  confirmed:     'brand',
  cutting:       'warning',
  stitching:     'warning',
  quality_check: 'warning',
  shipped:       'info',
  delivered:     'success',
  cancelled:     'error',
}

const STATUS_LABEL = {
  pending:       'Pending',
  confirmed:     'Confirmed',
  cutting:       'Cutting',
  stitching:     'Stitching',
  quality_check: 'QC Check',
  shipped:       'Shipped',
  delivered:     'Delivered',
  cancelled:     'Cancelled',
}

const TIMELINE_STEPS = [
  { key: 'pending',       label: 'Order Placed',     icon: Clock       },
  { key: 'confirmed',     label: 'Confirmed',        icon: CheckCircle2 },
  { key: 'cutting',       label: 'Cutting',          icon: Scissors    },
  { key: 'stitching',     label: 'Stitching',        icon: Package     },
  { key: 'quality_check', label: 'Quality Check',   icon: ShieldCheck  },
  { key: 'shipped',       label: 'Shipped',          icon: Truck       },
  { key: 'delivered',     label: 'Delivered',        icon: CheckCircle2 },
]

const STEP_ORDER = TIMELINE_STEPS.map((s) => s.key)

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function fmtAmount(n) {
  if (n == null) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function getStepState(stepKey, currentStatus) {
  if (currentStatus === 'cancelled') return 'cancelled'
  const currentIdx = STEP_ORDER.indexOf(currentStatus)
  const stepIdx    = STEP_ORDER.indexOf(stepKey)
  if (stepIdx < currentIdx)  return 'completed'
  if (stepIdx === currentIdx) return 'current'
  return 'future'
}

// ─── timeline ────────────────────────────────────────────────────────────────

function Timeline({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-md bg-red-50 border border-red-200">
        <XCircle size={22} className="text-error flex-shrink-0" />
        <div>
          <p className="font-sans font-medium text-error">Order Cancelled</p>
          <p className="text-xs text-muted font-sans mt-0.5">This order has been cancelled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, i) => {
        const state     = getStepState(step.key, status)
        const Icon      = step.icon
        const isLast    = i === TIMELINE_STEPS.length - 1

        const circleClass = {
          completed: 'bg-success border-success',
          current:   'bg-terracotta border-terracotta',
          future:    'bg-white border-border',
        }[state] || 'bg-white border-border'

        const iconClass = {
          completed: 'text-white',
          current:   'text-white',
          future:    'text-muted',
        }[state] || 'text-muted'

        const lineClass = state === 'completed' ? 'bg-success' : 'bg-border'

        return (
          <div key={step.key} className="flex gap-4">
            {/* Left column: circle + connector line */}
            <div className="flex flex-col items-center">
              <div className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${circleClass} transition-all duration-300`}>
                {state === 'completed' && <CheckCircle2 size={16} className="text-white" />}
                {state === 'current' && (
                  <>
                    <Icon size={14} className={iconClass} />
                    <span className="absolute inset-0 rounded-full bg-terracotta animate-ping opacity-25" />
                  </>
                )}
                {state === 'future' && <Icon size={14} className={iconClass} />}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] mt-1 ${lineClass} transition-colors duration-300`} />
              )}
            </div>

            {/* Right column: label */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <p
                className={`font-sans font-medium text-sm leading-9 ${
                  state === 'completed' ? 'text-success'
                  : state === 'current' ? 'text-terracotta'
                  : 'text-muted'
                }`}
              >
                {step.label}
                {state === 'current' && (
                  <span className="ml-2 text-xs font-normal bg-terracotta-light text-terracotta px-2 py-0.5 rounded-full">
                    In progress
                  </span>
                )}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── image lightbox ───────────────────────────────────────────────────────────

function ImageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null)

  if (!images?.length) return (
    <p className="text-sm text-muted font-sans italic">No inspiration images uploaded.</p>
  )

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightbox(img)}
            className="aspect-square rounded-sm overflow-hidden border border-border hover:border-terracotta transition-colors group focus:outline-none focus:ring-2 focus:ring-terracotta"
          >
            <img
              src={typeof img === 'string' ? img : img.url || img.image}
              alt={`Inspiration ${i + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-espresso/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-3xl max-h-[85vh] rounded-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={typeof lightbox === 'string' ? lightbox : lightbox.url || lightbox.image}
                alt="Inspiration"
                className="max-h-[85vh] object-contain"
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-espresso/60 text-white flex items-center justify-center hover:bg-espresso transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs font-sans text-terracotta hover:text-terracotta-dark transition-colors"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── star rating ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 focus:outline-none"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={`transition-colors duration-100 ${
              star <= (hovered || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-border'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── review form ──────────────────────────────────────────────────────────────

function ReviewForm({ orderId, onSuccess }) {
  const [rating, setRating] = useState(0)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/reviews/', { order: orderId, ...data }),
    onSuccess: () => {
      toast.success('Thank you for your review!')
      queryClient.invalidateQueries({ queryKey: ['order', String(orderId)] })
      onSuccess?.()
    },
    onError: (err) => toast.error(err.message || 'Could not submit review'),
  })

  const onSubmit = (data) => {
    if (!rating) return toast.error('Please select a rating')
    mutate({ rating, comment: data.comment })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-sm font-sans font-medium text-charcoal mb-2">Your Rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <Textarea
        label="Your Comment"
        rows={3}
        maxLength={500}
        placeholder="Tell us about your experience…"
        {...register('comment', { required: 'Please write a short comment' })}
        error={errors.comment?.message}
      />
      <Button type="submit" loading={isPending} size="md">
        Submit Review
      </Button>
    </form>
  )
}

// ─── invoice generator ────────────────────────────────────────────────────────

function generateInvoice(order) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(44, 24, 16) // espresso
  doc.text('TAILORYY', 20, 25)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(155, 138, 122) // muted
  doc.text('Bespoke Fashion House', 20, 32)
  doc.text('tailoryy.com', 20, 38)

  // Invoice title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(44, 24, 16)
  doc.text('INVOICE', 148, 25, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(74, 55, 40)
  doc.text(`Order: ${order.order_number || `#${order.id}`}`, 148, 33, { align: 'right' })
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, 148, 40, { align: 'right' })

  // Divider
  doc.setDrawColor(232, 221, 212)
  doc.line(20, 48, 190, 48)

  // Order info
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(44, 24, 16)
  doc.text('Order Details', 20, 58)

  const details = [
    ['Service Type',  order.service_type?.replace(/_/g, ' ') || '—'],
    ['Item Type',     order.item_type?.replace(/_/g, ' ')    || '—'],
    ['Status',        order.status?.replace(/_/g, ' ')       || '—'],
    ['Est. Delivery', order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString('en-IN') : 'TBD'],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  let y = 66
  details.forEach(([key, val]) => {
    doc.setTextColor(155, 138, 122)
    doc.text(key, 20, y)
    doc.setTextColor(44, 24, 16)
    doc.text(String(val), 90, y)
    y += 7
  })

  // Payment summary
  y += 4
  doc.setDrawColor(232, 221, 212)
  doc.line(20, y, 190, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(44, 24, 16)
  doc.text('Payment Summary', 20, y)
  y += 8

  const payments = [
    ['Subtotal',     fmtAmount(order.subtotal     ?? order.total_amount)],
    ['Advance Paid', fmtAmount(order.advance_paid ?? order.amount_paid)],
    ['Balance Due',  fmtAmount(order.balance_due  ?? 0)],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  payments.forEach(([key, val]) => {
    doc.setTextColor(155, 138, 122)
    doc.text(key, 20, y)
    doc.setTextColor(44, 24, 16)
    doc.text(val, 190, y, { align: 'right' })
    y += 7
  })

  y += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Total', 20, y)
  doc.text(fmtAmount(order.total_amount), 190, y, { align: 'right' })

  // Footer
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(155, 138, 122)
  doc.text('Thank you for choosing Tailoryy. Crafted with love.', 105, 280, { align: 'center' })

  doc.save(`tailoryy-invoice-${order.order_number || order.id}.pdf`)
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" rounded />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-32 w-full" rounded />
          <Skeleton className="h-48 w-full" rounded />
        </div>
        <Skeleton className="h-80 w-full" rounded />
      </div>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => api.get(`/orders/${id}/`).then((r) => r.data),
    enabled:  !!id,
  })

  if (isLoading) {
    return (
      <div className="section-padding">
        <div className="container-max">
          <OrderDetailSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="section-padding">
        <div className="container-max text-center py-16">
          <p className="font-serif text-xl text-espresso mb-4">Order not found</p>
          <Link to="/dashboard/orders">
            <Button variant="ghost">← Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const measurements = order.measurements || {}
  const measurementEntries = Object.entries(measurements).filter(([, v]) => v != null && v !== '')
  const hasReview = order.review != null
  const showReviewForm = order.status === 'delivered' && !hasReview

  const images = order.inspiration_images || order.images || []
  const fabrics = order.fabric_colors || order.fabrics || []
  const address = order.shipping_address || order.address || {}

  return (
    <>
      <Helmet>
        <title>
          {order.order_number ? `Order ${order.order_number}` : `Order #${id}`} — Tailoryy
        </title>
      </Helmet>

      <div className="section-padding">
        <div className="container-max">

          {/* Back button */}
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="inline-flex items-center gap-1.5 text-sm font-sans text-muted hover:text-terracotta transition-colors mb-6"
          >
            <ArrowLeft size={15} /> My Orders
          </button>

          {/* Order header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl text-espresso">
                {order.order_number || `Order #${id}`}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant={STATUS_VARIANT[order.status] || 'neutral'}>
                  {STATUS_LABEL[order.status] || order.status}
                </Badge>
                {order.service_type && (
                  <Badge variant="neutral" className="capitalize">
                    {order.service_type.replace(/_/g, ' ')}
                  </Badge>
                )}
                <span className="text-xs text-muted font-sans">Placed {fmt(order.created_at)}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0 self-start gap-1.5"
              onClick={() => generateInvoice(order)}
            >
              <Download size={14} /> Download Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. Inspiration images */}
              <section className="card-base p-6">
                <h2 className="font-serif text-lg text-espresso mb-4">Inspiration Images</h2>
                <ImageGallery images={images} />
              </section>

              {/* 2. Measurements */}
              {measurementEntries.length > 0 && (
                <section className="card-base p-6">
                  <h2 className="font-serif text-lg text-espresso mb-4">Measurements</h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {measurementEntries.map(([key, val]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-sm font-sans text-muted capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-sans font-medium text-espresso">
                          {val} {typeof val === 'number' ? 'cm' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 3. Fabric & colours */}
              {fabrics.length > 0 && (
                <section className="card-base p-6">
                  <h2 className="font-serif text-lg text-espresso mb-4">Fabric & Colours</h2>
                  <div className="flex flex-wrap gap-2">
                    {fabrics.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream border border-border text-sm font-sans text-charcoal"
                      >
                        {f.color && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0"
                            style={{ backgroundColor: f.color }}
                          />
                        )}
                        {f.name || f.fabric || String(f)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Shipping address */}
              {Object.keys(address).length > 0 && (
                <section className="card-base p-6">
                  <h2 className="font-serif text-lg text-espresso mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-terracotta" /> Shipping Address
                  </h2>
                  <div className="text-sm font-sans text-charcoal space-y-0.5">
                    {address.full_name && <p className="font-medium">{address.full_name}</p>}
                    {address.line1 && <p>{address.line1}</p>}
                    {address.line2 && <p>{address.line2}</p>}
                    {(address.city || address.state || address.pincode) && (
                      <p>
                        {[address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {address.country && <p>{address.country}</p>}
                    {address.phone && <p className="text-muted mt-1">Ph: {address.phone}</p>}
                  </div>
                </section>
              )}

              {/* 5. Payment summary */}
              <section className="card-base p-6">
                <h2 className="font-serif text-lg text-espresso mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-terracotta" /> Payment Summary
                </h2>
                <div className="space-y-2">
                  {[
                    { label: 'Subtotal',     value: order.subtotal     ?? order.total_amount },
                    { label: 'Advance Paid', value: order.advance_paid ?? order.amount_paid  },
                    { label: 'Balance Due',  value: order.balance_due  ?? null               },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-1.5 border-b border-border/60">
                      <span className="text-sm font-sans text-muted">{label}</span>
                      <span className="text-sm font-sans font-medium text-espresso">
                        {fmtAmount(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 mt-1">
                    <span className="font-sans font-semibold text-espresso">Total</span>
                    <span className="font-sans font-bold text-terracotta text-lg">
                      {fmtAmount(order.total_amount)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 6. Tracking number */}
              {order.tracking_number && (
                <section className="card-base p-6">
                  <h2 className="font-serif text-lg text-espresso mb-3">Tracking</h2>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-sm">
                    <Truck size={16} className="text-blue-600 flex-shrink-0" />
                    <code className="flex-1 font-mono text-sm text-blue-800 break-all">
                      {order.tracking_number}
                    </code>
                    <CopyButton text={order.tracking_number} />
                  </div>
                  {order.courier && (
                    <p className="text-xs text-muted font-sans mt-1.5">Courier: {order.courier}</p>
                  )}
                </section>
              )}

              {/* Review form */}
              {showReviewForm && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-6 border-2 border-terracotta-light"
                >
                  <h2 className="font-serif text-lg text-espresso mb-1">Leave a Review</h2>
                  <p className="text-sm text-muted font-sans mb-5">
                    How was your experience? Your feedback helps us improve.
                  </p>
                  <ReviewForm orderId={order.id} />
                </motion.section>
              )}

              {/* Existing review */}
              {hasReview && (
                <section className="card-base p-6 bg-green-50 border border-green-200">
                  <h2 className="font-serif text-lg text-success mb-2 flex items-center gap-2">
                    <CheckCircle2 size={18} /> Review Submitted
                  </h2>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < order.review.rating ? 'text-amber-400 fill-amber-400' : 'text-border'}
                      />
                    ))}
                  </div>
                  {order.review.comment && (
                    <p className="text-sm font-sans text-charcoal">{order.review.comment}</p>
                  )}
                </section>
              )}
            </div>

            {/* Sidebar: Timeline */}
            <div className="space-y-6">
              <div className="card-base p-6 sticky top-24">
                <h2 className="font-serif text-lg text-espresso mb-5">Order Status</h2>
                <Timeline status={order.status} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
