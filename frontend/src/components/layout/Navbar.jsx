// Navbar.jsx — Sticky top navigation with blur backdrop, mobile drawer, auth-aware
import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Bell, ChevronDown, LogOut, User, Package, Heart, MessageCircle } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import useAuthStore from '../../store/authStore'

const navLinks = [
  { to: '/',               label: 'Home' },
  { to: '/portfolio',      label: 'Portfolio' },
  { to: '/how-it-works',   label: 'How It Works' },
  { to: '/services',       label: 'Services' },
  { to: '/fabric-catalogue', label: 'Fabric Catalogue' },
  { to: '/contact',        label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [drawerOpen, setDrawer]   = useState(false)
  const [dropdownOpen, setDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    setDropdown(false)
    navigate('/')
  }

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-ivory/80 backdrop-blur-[12px] border-b border-border shadow-card'
            : 'bg-transparent'}
        `}
      >
        <div className="container-max">
          <nav className="flex items-center justify-between h-16 lg:h-18">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <span className="font-sans text-xl font-medium text-espresso tracking-tight">
                tailor
              </span>
              <span className="font-serif text-xl font-semibold text-terracotta italic tracking-tight">
                yy
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `
                      px-4 py-2 text-sm font-sans font-medium rounded-sm transition-colors duration-200
                      ${isActive
                        ? 'text-terracotta bg-terracotta-light/60'
                        : 'text-charcoal hover:text-terracotta hover:bg-cream'}
                    `}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  {/* Notifications bell */}
                  <Link
                    to="/dashboard/notifications"
                    className="relative p-2 rounded-sm text-charcoal hover:text-terracotta hover:bg-cream transition-colors hidden lg:flex"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {/* Unread dot — shown conditionally */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-terracotta rounded-full" />
                  </Link>

                  {/* Avatar dropdown */}
                  <div className="relative hidden lg:block" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdown((p) => !p)}
                      className="flex items-center gap-2 py-1 px-2 rounded-sm hover:bg-cream transition-colors"
                      aria-expanded={dropdownOpen}
                      aria-haspopup="true"
                    >
                      <Avatar src={user.profile_picture} name={user.full_name} size="sm" />
                      <span className="text-sm font-sans text-charcoal hidden xl:block max-w-[120px] truncate">
                        {user.full_name?.split(' ')[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-hover overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-border">
                            <p className="text-sm font-medium text-espresso truncate">{user.full_name}</p>
                            <p className="text-xs text-muted truncate">{user.email}</p>
                          </div>
                          <ul className="py-1">
                            {user.role === 'admin' && (
                              <DropdownItem to="/admin" icon={<User size={15} />} label="Admin Panel" onClick={() => setDropdown(false)} />
                            )}
                            <DropdownItem to="/dashboard" icon={<Package size={15} />} label="My Orders" onClick={() => setDropdown(false)} />
                            <DropdownItem to="/dashboard/messages" icon={<MessageCircle size={15} />} label="Messages" onClick={() => setDropdown(false)} />
                            <DropdownItem to="/dashboard/wishlist" icon={<Heart size={15} />} label="Wishlist" onClick={() => setDropdown(false)} />
                            <DropdownItem to="/dashboard/profile" icon={<User size={15} />} label="Profile" onClick={() => setDropdown(false)} />
                            <li>
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors"
                              >
                                <LogOut size={15} />
                                Sign Out
                              </button>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-sans font-medium text-charcoal hover:text-terracotta transition-colors rounded-sm hover:bg-cream"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-5 py-2">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setDrawer(true)}
                className="lg:hidden p-2 rounded-sm text-charcoal hover:text-terracotta hover:bg-cream transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-espresso/40 z-50 lg:hidden"
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-ivory z-50 flex flex-col shadow-hover lg:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <span className="font-sans font-medium text-espresso">tailor<span className="font-serif text-terracotta italic">yy</span></span>
                <button
                  onClick={() => setDrawer(false)}
                  className="p-1.5 rounded-sm text-muted hover:text-espresso hover:bg-cream transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-4">
                <ul className="space-y-1">
                  {navLinks.map(({ to, label }) => (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={to === '/'}
                        onClick={() => setDrawer(false)}
                        className={({ isActive }) => `
                          block px-4 py-3 rounded-sm text-sm font-sans font-medium transition-colors
                          ${isActive ? 'text-terracotta bg-terracotta-light/60' : 'text-charcoal hover:bg-cream'}
                        `}
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="px-4 py-5 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-2 mb-3">
                      <Avatar src={user?.profile_picture} name={user?.full_name} size="md" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-espresso truncate">{user?.full_name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDrawer(false)}
                      className="btn-ghost w-full text-center block"
                    >
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full text-sm text-error py-2 text-center">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setDrawer(false)} className="btn-ghost w-full text-center block">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setDrawer(false)} className="btn-primary w-full text-center block">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function DropdownItem({ to, icon, label, onClick }) {
  return (
    <li>
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-4 py-2 text-sm text-charcoal hover:bg-cream hover:text-terracotta transition-colors"
      >
        {icon}
        {label}
      </Link>
    </li>
  )
}
