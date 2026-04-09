// AdminSidebar.jsx — Persistent admin navigation sidebar
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard,
  Package,
  MessageCircle,
  Image,
  Layers,
  Users,
  Star,
  Tag,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import api from '../../services/api'

// ─── nav config ───────────────────────────────────────────────────────────────

const navItems = [
  { label: 'Dashboard',        to: '/admin',              icon: LayoutDashboard, exact: true },
  { label: 'Orders',           to: '/admin/orders',       icon: Package,         badgeKey: 'pendingOrders' },
  { label: 'Messages',         to: '/admin/messages',     icon: MessageCircle,   badgeKey: 'unreadMessages' },
  { label: 'Portfolio',        to: '/admin/portfolio',    icon: Image },
  { label: 'Fabric Catalogue', to: '/admin/fabrics',      icon: Layers },
  { label: 'Customers',        to: '/admin/customers',    icon: Users },
  { label: 'Reviews',          to: '/admin/reviews',      icon: Star },
  { label: 'Promo Codes',      to: '/admin/promo-codes',  icon: Tag },
]

// ─── badge dot ────────────────────────────────────────────────────────────────

function NavBadge({ count }) {
  if (!count || count < 1) return null
  return (
    <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-terracotta text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ─── single nav item ──────────────────────────────────────────────────────────

function SidebarLink({ item, badges, onClick }) {
  const Icon = item.icon
  const count = item.badgeKey ? (badges?.[item.badgeKey] ?? 0) : 0

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-r-sm text-sm font-sans font-medium
         transition-all duration-150 group relative
         ${isActive
           ? 'text-terracotta bg-terracotta/5 border-l-2 border-terracotta -ml-px'
           : 'text-charcoal hover:text-terracotta hover:bg-terracotta/5 border-l-2 border-transparent -ml-px'
         }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      <NavBadge count={count} />
    </NavLink>
  )
}

// ─── sidebar inner content ────────────────────────────────────────────────────

function SidebarContent({ badges, onNavClick }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border flex-shrink-0">
        <div className="flex flex-col">
          <span className="font-serif text-2xl text-espresso tracking-wide">tailoryy</span>
          <span className="text-[10px] font-sans font-semibold text-muted uppercase tracking-widest -mt-1">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 pl-px space-y-0.5">
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            badges={badges}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-border px-4 py-4 space-y-1 flex-shrink-0">
        {/* Admin avatar strip */}
        {user && (
          <div className="flex items-center gap-2.5 px-1 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold font-serif">
                {(user.full_name || user.email || 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-sans font-semibold text-espresso truncate">
                {user.full_name || 'Admin'}
              </p>
              <p className="text-[10px] font-sans text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}

        {/* Back to site */}
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-sans text-muted hover:text-terracotta hover:bg-terracotta/5 transition-colors"
        >
          <ExternalLink size={16} />
          Back to Site
        </a>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-sans text-muted hover:text-error hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

// ─── main export ──────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Fetch badge counts
  const { data: stats } = useQuery({
    queryKey: ['admin', 'sidebar-counts'],
    queryFn: async () => {
      const [ordersRes, msgsRes] = await Promise.allSettled([
        api.get('/orders/stats'),
        api.get('/messages/conversations'),
      ])
      const orderData = ordersRes.status === 'fulfilled' ? ordersRes.value.data : {}
      const msgData   = msgsRes.status === 'fulfilled'   ? msgsRes.value.data  : {}

      const conversations = Array.isArray(msgData)
        ? msgData
        : msgData.results ?? msgData.conversations ?? []

      const unreadMessages = conversations.reduce(
        (sum, c) => sum + (c.unread_count_admin ?? c.unread_admin ?? 0),
        0
      )

      return {
        pendingOrders:  orderData.pending_count ?? orderData.pending ?? 0,
        unreadMessages,
      }
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  })

  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-sm bg-white border border-border shadow-sm flex items-center justify-center text-espresso hover:text-terracotta transition-colors"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed inset-0 bg-espresso/40 backdrop-blur-sm z-40"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-border z-50 shadow-lg overflow-hidden"
          >
            <SidebarContent badges={stats} onNavClick={closeMobile} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Desktop fixed sidebar ── */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-border z-30 overflow-hidden">
        <SidebarContent badges={stats} onNavClick={undefined} />
      </aside>
    </>
  )
}
