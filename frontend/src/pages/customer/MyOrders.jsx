// MyOrders.jsx — Customer orders list page
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Scissors,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  ShieldCheck,
  Shirt,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'

// ─── constants ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'all',         label: 'All'        },
  { key: 'pending',     label: 'Pending'    },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'delivered',   label: 'Delivered'  },
  { key: 'cancelled',   label: 'Cancelled'  },
]

// Which backend statuses map to "in_progress" tab
const IN_PROGRESS_STATUSES = ['confirmed', 'cutting', 'stitching', 'quality_check', 'shipped']

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

const STATUS_ICON = {
  pending:       Clock,
  confirmed:     CheckCircle2,
  cutting:       Scissors,
  stitching:     Shirt,
  quality_check: ShieldCheck,
  shipped:       Truck,
  delivered:     CheckCircle2,
  cancelled:     XCircle,
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fmtAmount(n) {
  if (n == null) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

function matchesTab(order, tab) {
  if (tab === 'all')         return true
  if (tab === 'in_progress') return IN_PROGRESS_STATUSES.includes(order.status)
  if (tab === 'pending')     return order.status === 'pending'
  if (tab === 'delivered')   return order.status === 'delivered'
  if (tab === 'cancelled')   return order.status === 'cancelled'
  return true
}

// ─── skeleton card ────────────────────────────────────────────────────────────

function OrderSkeletonCard() {
  return (
    <div className="card-base p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" rounded />
        <Skeleton className="h-5 w-20" rounded />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16" rounded />
        <Skeleton className="h-5 w-16" rounded />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" rounded />
        <Skeleton className="h-3 w-20" rounded />
      </div>
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-5 w-16" rounded />
        <Skeleton className="h-9 w-28" rounded />
      </div>
    </div>
  )
}

// ─── empty state ─────────────────────────────────────────────────────────────

function EmptyState({ tab }) {
  const messages = {
    all:         { title: 'No orders yet',         sub: 'Your bespoke journey starts here.', showCta: true  },
    pending:     { title: 'No pending orders',      sub: 'All your orders have been confirmed!', showCta: false },
    in_progress: { title: 'Nothing in progress',   sub: 'Your orders will appear here once they start.',     showCta: false },
    delivered:   { title: 'No delivered orders',   sub: 'Completed orders will show up here.',  showCta: false },
    cancelled:   { title: 'No cancelled orders',   sub: 'Great — nothing was cancelled!',      showCta: false },
  }
  const { title, sub, showCta } = messages[tab] || messages.all

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4">
        <ShoppingBag size={28} className="text-terracotta" />
      </div>
      <h3 className="font-serif text-xl text-espresso mb-2">{title}</h3>
      <p className="text-muted font-sans text-sm max-w-xs mb-5">{sub}</p>
      {showCta && (
        <Link to="/order">
          <Button size="md">Place Your First Order</Button>
        </Link>
      )}
    </div>
  )
}

// ─── order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const StatusIcon = STATUS_ICON[order.status] || Package
  const statusVariant = STATUS_VARIANT[order.status] || 'neutral'
  const statusLabel   = STATUS_LABEL[order.status]  || order.status

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="card-base p-5"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-sans font-semibold text-espresso">
            {order.order_number || `Order #${order.id}`}
          </p>
          <p className="text-xs text-muted font-sans mt-0.5">Placed {fmt(order.created_at)}</p>
        </div>
        <Badge variant={statusVariant} className="flex items-center gap-1 flex-shrink-0">
          <StatusIcon size={11} />
          {statusLabel}
        </Badge>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {order.service_type && (
          <Badge variant="neutral" className="capitalize">
            {order.service_type.replace(/_/g, ' ')}
          </Badge>
        )}
        {order.item_type && (
          <Badge variant="neutral" className="capitalize">
            {order.item_type.replace(/_/g, ' ')}
          </Badge>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-sans text-muted mb-4">
        <span>
          <span className="text-charcoal font-medium">Est. delivery: </span>
          {fmt(order.estimated_delivery_date) || 'TBD'}
        </span>
        <span>
          <span className="text-charcoal font-medium">Amount: </span>
          {fmtAmount(order.total_amount)}
        </span>
      </div>

      {/* Action */}
      <div className="flex justify-end border-t border-border pt-3 mt-1">
        <Link to={`/dashboard/orders/${order.id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            View Details <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function MyOrders() {
  const [activeTab, setActiveTab] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['orders', 'list'],
    queryFn:  () => api.get('/orders/').then((r) => r.data),
    staleTime: 30_000,
  })

  const allOrders = data?.results ?? data ?? []
  const filtered  = allOrders.filter((o) => matchesTab(o, activeTab))

  // Count per tab for badges
  const counts = {
    all:         allOrders.length,
    pending:     allOrders.filter((o) => o.status === 'pending').length,
    in_progress: allOrders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length,
    delivered:   allOrders.filter((o) => o.status === 'delivered').length,
    cancelled:   allOrders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <>
      <Helmet>
        <title>My Orders — Tailoryy</title>
      </Helmet>

      <div className="section-padding">
        <div className="container-max">

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-serif text-3xl text-espresso">My Orders</h1>
            {!isLoading && (
              <p className="text-muted font-sans text-sm mt-1">
                {allOrders.length} order{allOrders.length !== 1 ? 's' : ''} total
              </p>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-sans font-medium
                  whitespace-nowrap transition-all duration-200 flex-shrink-0
                  ${activeTab === tab.key
                    ? 'bg-terracotta text-white shadow-sm'
                    : 'bg-cream text-charcoal hover:bg-border'}
                `}
              >
                {tab.label}
                {counts[tab.key] > 0 && (
                  <span
                    className={`
                      text-[10px] px-1.5 py-0.5 rounded-full font-bold
                      ${activeTab === tab.key ? 'bg-white/30 text-white' : 'bg-border text-muted'}
                    `}
                  >
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Order cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => <OrderSkeletonCard key={n} />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered
                  .slice()
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
              </div>
            </AnimatePresence>
          )}

        </div>
      </div>
    </>
  )
}
