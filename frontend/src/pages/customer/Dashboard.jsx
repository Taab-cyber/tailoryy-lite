// Dashboard.jsx — Customer dashboard home page
import React, { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Heart,
  ArrowRight,
  MessageSquare,
  BookOpen,
  Package,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import Button from '../../components/ui/Button'

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

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

const IN_PROGRESS_STATUSES = ['confirmed', 'cutting', 'stitching', 'quality_check', 'shipped']

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

// ─── stat card ──────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(44,24,16,0.14)' }}
      transition={{ duration: 0.2 }}
      className="card-base p-5 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-sans text-muted uppercase tracking-wide mb-0.5">{label}</p>
        {loading ? (
          <Skeleton className="h-6 w-10" rounded />
        ) : (
          <p className="font-serif text-2xl text-espresso leading-none">{value ?? '0'}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── empty state ────────────────────────────────────────────────────────────

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center py-16 px-4 text-center">
      {/* CSS art — dress silhouette */}
      <div className="relative w-24 h-32 mb-6" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-terracotta-light" />
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[20px] border-l-transparent
          border-r-[20px] border-r-transparent
          border-t-[28px] border-t-terracotta-light" />
        <div className="absolute top-14 left-1/2 -translate-x-1/2 w-16 h-16
          bg-terracotta-light rounded-b-lg" />
        <div className="absolute bottom-0 left-3 w-3 h-6 bg-terracotta-light rounded-b-sm" />
        <div className="absolute bottom-0 right-3 w-3 h-6 bg-terracotta-light rounded-b-sm" />
      </div>
      <h3 className="font-serif text-xl text-espresso mb-2">No orders yet</h3>
      <p className="text-muted font-sans text-sm max-w-xs mb-6">
        Your bespoke journey starts here. Place your first order and let us craft something beautiful for you.
      </p>
      <Button as={Link} to="/order" size="md">
        Place Your First Order
      </Button>
    </div>
  )
}

// ─── recent order row ────────────────────────────────────────────────────────

function OrderRow({ order }) {
  return (
    <Link
      to={`/dashboard/orders/${order.id}`}
      className="flex items-center gap-3 p-3 rounded-sm hover:bg-cream transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-terracotta-light flex items-center justify-center flex-shrink-0">
        <Package size={14} className="text-terracotta" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans font-medium text-sm text-espresso truncate">
            {order.order_number || `#${order.id}`}
          </span>
          {order.service_type && (
            <Badge variant="neutral" className="capitalize text-[11px]">
              {order.service_type.replace(/_/g, ' ')}
            </Badge>
          )}
          <Badge variant={STATUS_VARIANT[order.status] || 'neutral'}>
            {STATUS_LABEL[order.status] || order.status}
          </Badge>
        </div>
        <p className="text-xs text-muted font-sans mt-0.5">{fmt(order.created_at)}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-sans font-semibold text-sm text-espresso">{fmtAmount(order.total_amount)}</p>
        <ArrowRight
          size={14}
          className="ml-auto mt-1 text-muted group-hover:text-terracotta transition-colors"
        />
      </div>
    </Link>
  )
}

// ─── main component ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuthStore()
  const firstName = user?.full_name?.split(' ')[0] || 'there'
  const greeting = useMemo(() => getGreeting(), [])

  // Fetch all orders for stats + recent list
  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', 'all'],
    queryFn:  () => api.get('/orders/').then((r) => r.data),
    staleTime: 30_000,
  })

  // Fetch wishlist count
  const { data: wishlistData, isLoading: loadingWishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn:  () => api.get('/wishlist/').then((r) => r.data),
    staleTime: 60_000,
  })

  // Fetch unread message count
  const { data: convData } = useQuery({
    queryKey: ['messages', 'conversation'],
    queryFn:  () => api.get('/messages/my-conversation').then((r) => r.data),
    staleTime: 30_000,
  })

  const orders = ordersData?.results ?? ordersData ?? []
  const totalOrders    = orders.length
  const inProgress     = orders.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length
  const delivered      = orders.filter((o) => o.status === 'delivered').length
  const wishlistCount  = wishlistData?.results?.length ?? wishlistData?.length ?? 0
  const unreadMessages = convData?.unread_count_customer ?? 0
  const recentOrders   = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders',    value: totalOrders,   color: 'bg-cream text-terracotta',        loading: loadingOrders   },
    { icon: Clock,       label: 'In Progress',     value: inProgress,    color: 'bg-amber-50 text-warning',        loading: loadingOrders   },
    { icon: CheckCircle, label: 'Delivered',        value: delivered,     color: 'bg-green-50 text-success',        loading: loadingOrders   },
    { icon: Heart,       label: 'Wishlist Items',   value: wishlistCount, color: 'bg-terracotta-light text-terracotta', loading: loadingWishlist },
  ]

  return (
    <>
      <Helmet>
        <title>My Dashboard — Tailoryy</title>
      </Helmet>

      <div className="section-padding">
        <div className="container-max">

          {/* Welcome heading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <p className="text-muted font-sans text-sm mb-1">{greeting},</p>
            <h1 className="font-serif text-3xl md:text-4xl text-espresso">
              {firstName}!
            </h1>
            <p className="text-muted font-sans text-sm mt-1.5">
              Here's what's happening with your orders.
            </p>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent orders */}
            <div className="lg:col-span-2 card-base p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl text-espresso">Recent Orders</h2>
                <Link
                  to="/dashboard/orders"
                  className="text-sm font-sans text-terracotta hover:underline"
                >
                  View all
                </Link>
              </div>

              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3">
                      <Skeleton circle className="w-8 h-8" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-40" rounded />
                        <Skeleton className="h-3 w-24" rounded />
                      </div>
                      <Skeleton className="h-4 w-14" rounded />
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <EmptyOrders />
              ) : (
                <div className="divide-y divide-border">
                  {recentOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <div className="card-base p-6">
                <h2 className="font-serif text-xl text-espresso mb-4">Quick Actions</h2>
                <div className="flex flex-col gap-3">

                  <Link
                    to="/order"
                    className="flex items-center gap-3 p-3.5 rounded-sm border border-border hover:border-terracotta hover:bg-cream transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-terracotta-light flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors">
                      <ShoppingBag size={16} className="text-terracotta group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm text-espresso">Place New Order</p>
                      <p className="text-xs text-muted">Start your bespoke journey</p>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-terracotta transition-colors" />
                  </Link>

                  <Link
                    to="/dashboard/messages"
                    className="flex items-center gap-3 p-3.5 rounded-sm border border-border hover:border-terracotta hover:bg-cream transition-all group"
                  >
                    <div className="relative w-9 h-9 rounded-full bg-terracotta-light flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors">
                      <MessageSquare size={16} className="text-terracotta group-hover:text-white transition-colors" />
                      {unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm text-espresso">My Messages</p>
                      <p className="text-xs text-muted">
                        {unreadMessages > 0 ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}` : 'Chat with our team'}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-terracotta transition-colors" />
                  </Link>

                  <Link
                    to="/portfolio"
                    className="flex items-center gap-3 p-3.5 rounded-sm border border-border hover:border-terracotta hover:bg-cream transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-terracotta-light flex items-center justify-center flex-shrink-0 group-hover:bg-terracotta transition-colors">
                      <BookOpen size={16} className="text-terracotta group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-sans font-medium text-sm text-espresso">Browse Portfolio</p>
                      <p className="text-xs text-muted">Get inspired by our work</p>
                    </div>
                    <ArrowRight size={14} className="text-muted group-hover:text-terracotta transition-colors" />
                  </Link>

                </div>
              </div>

              {/* Wishlist teaser */}
              <Link
                to="/dashboard/wishlist"
                className="card-base p-4 flex items-center gap-3 hover:shadow-hover transition-shadow group block"
              >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Heart size={18} className="text-error" />
                </div>
                <div className="flex-1">
                  <p className="font-sans font-medium text-sm text-espresso">My Wishlist</p>
                  <p className="text-xs text-muted">
                    {loadingWishlist ? '…' : `${wishlistCount} saved item${wishlistCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:text-terracotta transition-colors" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
