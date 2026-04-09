// AdminDashboard.jsx — Admin overview with metrics, charts, recent orders
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import {
  Package, IndianRupee, Clock, CheckCircle2, MessageCircle, TrendingUp,
} from 'lucide-react'
import { format, parseISO, subDays } from 'date-fns'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import api from '../../services/api'

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_VARIANT = {
  pending:       'warning',
  confirmed:     'info',
  cutting:       'info',
  stitching:     'info',
  quality_check: 'warning',
  shipped:       'brand',
  delivered:     'success',
  cancelled:     'error',
}

const SERVICE_COLORS = {
  custom_stitch: '#C27560',
  upcycle:       '#D4A373',
  own_fabric:    '#8B6F47',
}

const MOCK_BAR_DATA = Array.from({ length: 7 }, (_, i) => {
  const d = subDays(new Date(), 6 - i)
  return {
    day:    format(d, 'EEE'),
    orders: Math.floor(Math.random() * 12) + 1,
  }
})

const MOCK_PIE_DATA = [
  { name: 'Custom Stitch', value: 45, key: 'custom_stitch' },
  { name: 'Upcycle',       value: 30, key: 'upcycle' },
  { name: 'Own Fabric',    value: 25, key: 'own_fabric' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '—'
  try { return format(typeof d === 'string' ? parseISO(d) : new Date(d), 'dd MMM yyyy') }
  catch { return '—' }
}

function fmtRupee(n) {
  if (n === undefined || n === null) return '—'
  return `₹${Number(n).toLocaleString('en-IN')}`
}

// ─── metric card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon, color, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card-base p-5 flex items-start gap-4"
    >
      <div className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans text-muted uppercase tracking-wider mb-1">{label}</p>
        {loading ? (
          <Skeleton className="h-7 w-24" rounded />
        ) : (
          <p className="font-serif text-2xl text-espresso font-semibold">{value ?? '—'}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── custom pie label ─────────────────────────────────────────────────────────

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ─── recent orders table ──────────────────────────────────────────────────────

function RecentOrdersTable({ orders, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" rounded />
        ))}
      </div>
    )
  }
  if (!orders?.length) {
    return <p className="text-muted font-sans text-sm py-6 text-center">No recent orders.</p>
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm font-sans min-w-[640px]">
        <thead>
          <tr className="border-b border-border">
            {['Order #', 'Customer', 'Service', 'Date', 'Status', 'Amount', ''].map((h) => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-cream/50 transition-colors">
              <td className="px-3 py-3 font-mono text-xs text-terracotta">
                #{String(o.id).slice(0, 8)}
              </td>
              <td className="px-3 py-3 text-charcoal">{o.customer_name || o.customer?.full_name || '—'}</td>
              <td className="px-3 py-3">
                <Badge variant="brand">
                  {(o.service_type || '').replace(/_/g, ' ') || '—'}
                </Badge>
              </td>
              <td className="px-3 py-3 text-muted text-xs">{fmtDate(o.created_at)}</td>
              <td className="px-3 py-3">
                <Badge variant={STATUS_VARIANT[o.status] || 'neutral'}>
                  {(o.status || '').replace(/_/g, ' ')}
                </Badge>
              </td>
              <td className="px-3 py-3 font-medium text-espresso">{fmtRupee(o.total_amount)}</td>
              <td className="px-3 py-3">
                <Link
                  to={`/admin/orders/${o.id}`}
                  className="text-terracotta hover:underline text-xs font-medium"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'orders-stats'],
    queryFn:  () => api.get('/orders/stats').then((r) => r.data),
    staleTime: 60_000,
  })

  // Recent orders
  const { data: recentData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn:  () => api.get('/orders/', { params: { limit: 10, ordering: '-created_at' } }).then((r) => r.data),
    staleTime: 30_000,
  })

  // Unread messages
  const { data: msgData } = useQuery({
    queryKey: ['admin', 'conversations-count'],
    queryFn:  () => api.get('/messages/conversations').then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 30_000,
  })

  const recentOrders = Array.isArray(recentData)
    ? recentData.slice(0, 10)
    : recentData?.results?.slice(0, 10) ?? []

  const conversations = Array.isArray(msgData)
    ? msgData
    : msgData?.results ?? msgData?.conversations ?? []
  const unreadCount = conversations.reduce(
    (s, c) => s + (c.unread_count_admin ?? c.unread_admin ?? 0), 0
  )

  // Chart data — prefer API, fallback to mock
  const barData = stats?.orders_per_day?.length
    ? stats.orders_per_day.map((d) => ({ day: d.day || d.date, orders: d.count }))
    : MOCK_BAR_DATA

  const pieData = stats?.by_service_type
    ? Object.entries(stats.by_service_type).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value,
        key,
      }))
    : MOCK_PIE_DATA

  const metrics = [
    {
      label: "Today's Orders",
      value: stats?.today_orders ?? stats?.today ?? '—',
      icon: Package,
      color: 'bg-terracotta',
    },
    {
      label: 'Total Revenue',
      value: fmtRupee(stats?.total_revenue),
      icon: IndianRupee,
      color: 'bg-amber-600',
    },
    {
      label: 'Pending Orders',
      value: stats?.pending_count ?? stats?.pending ?? '—',
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      label: 'Delivered This Month',
      value: stats?.delivered_this_month ?? stats?.delivered_month ?? '—',
      icon: CheckCircle2,
      color: 'bg-green-600',
    },
  ]

  return (
    <>
      <Helmet><title>Admin Dashboard — Tailoryy</title></Helmet>

      <div className="flex min-h-screen bg-ivory">
        <AdminSidebar />

        {/* Main content — offset by sidebar width on desktop */}
        <div className="flex-1 lg:ml-[240px] min-w-0">
          <div className="px-4 lg:px-8 py-8 max-w-7xl">

            {/* Page header */}
            <div className="mb-8 mt-2 lg:mt-0">
              <h1 className="font-serif text-3xl text-espresso">Dashboard</h1>
              <p className="text-muted font-sans text-sm mt-1">
                Welcome back — here's what's happening at Tailoryy.
              </p>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {metrics.map((m) => (
                <MetricCard key={m.label} {...m} loading={statsLoading} />
              ))}
            </div>

            {/* Unread messages banner */}
            {unreadCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-terracotta/10 border border-terracotta/30 rounded-sm flex items-center gap-3"
              >
                <MessageCircle size={20} className="text-terracotta flex-shrink-0" />
                <p className="font-sans text-sm text-terracotta flex-1">
                  You have <strong>{unreadCount}</strong> unread customer message{unreadCount !== 1 ? 's' : ''}.
                </p>
                <Link
                  to="/admin/messages"
                  className="text-xs font-semibold text-terracotta underline hover:no-underline"
                >
                  View Messages
                </Link>
              </motion.div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Bar chart — orders per day */}
              <div className="lg:col-span-2 card-base p-5">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={18} className="text-terracotta" />
                  <h2 className="font-serif text-lg text-espresso">Orders — Last 7 Days</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9C8C80' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9C8C80' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ border: '1px solid #E8E0D8', borderRadius: 4, fontSize: 12 }}
                      cursor={{ fill: 'rgba(194, 117, 96, 0.08)' }}
                    />
                    <Bar dataKey="orders" fill="#C27560" radius={[3, 3, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut chart — orders by service */}
              <div className="card-base p-5">
                <h2 className="font-serif text-lg text-espresso mb-5">By Service Type</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {pieData.map((entry, i) => (
                        <Cell
                          key={entry.key || i}
                          fill={SERVICE_COLORS[entry.key] || ['#C27560', '#D4A373', '#8B6F47'][i % 3]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(val) => <span style={{ fontSize: 11, color: '#5C4A3A' }}>{val}</span>}
                    />
                    <Tooltip
                      contentStyle={{ border: '1px solid #E8E0D8', borderRadius: 4, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent orders */}
            <div className="card-base p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-lg text-espresso">Recent Orders</h2>
                <Link
                  to="/admin/orders"
                  className="text-xs font-sans font-medium text-terracotta hover:underline"
                >
                  View all →
                </Link>
              </div>
              <RecentOrdersTable orders={recentOrders} loading={ordersLoading} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
