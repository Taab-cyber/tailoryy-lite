// App.jsx — Root component: route definitions, layout wrapper, lazy loading
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Spinner from './components/ui/Spinner'
import ErrorBoundary from './components/ErrorBoundary'
import ChatFAB from './components/ChatFAB'

// ── Lazy-loaded pages ────────────────────────────────────────────
// Public
const Home             = lazy(() => import('./pages/public/Home'))
const Portfolio        = lazy(() => import('./pages/public/Portfolio'))
const HowItWorks       = lazy(() => import('./pages/public/HowItWorks'))
const Services         = lazy(() => import('./pages/public/Services'))
const FabricCatalogue  = lazy(() => import('./pages/public/FabricCatalogue'))
const Contact          = lazy(() => import('./pages/public/Contact'))
const FAQ              = lazy(() => import('./pages/public/FAQ'))

// Auth
const Login            = lazy(() => import('./pages/auth/Login'))
const Register         = lazy(() => import('./pages/auth/Register'))

// Customer
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'))
const MyOrders          = lazy(() => import('./pages/customer/MyOrders'))
const OrderDetail       = lazy(() => import('./pages/customer/OrderDetail'))
const OrderForm         = lazy(() => import('./pages/customer/OrderForm'))
const Profile           = lazy(() => import('./pages/customer/Profile'))
const Wishlist          = lazy(() => import('./pages/customer/Wishlist'))
const Messages          = lazy(() => import('./pages/customer/Messages'))

// Admin
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'))
const AdminPortfolio   = lazy(() => import('./pages/admin/AdminPortfolio'))
const AdminFabrics     = lazy(() => import('./pages/admin/AdminFabrics'))
const AdminCustomers   = lazy(() => import('./pages/admin/AdminCustomers'))
const AdminReviews     = lazy(() => import('./pages/admin/AdminReviews'))
const AdminPromoCodes  = lazy(() => import('./pages/admin/AdminPromoCodes'))
const AdminMessages    = lazy(() => import('./pages/admin/AdminMessages'))

// Misc
const NotFound         = lazy(() => import('./pages/NotFound'))

// ── Route guards ─────────────────────────────────────────────────
const ProtectedRoute  = lazy(() => import('./components/ProtectedRoute'))
const AdminRoute      = lazy(() => import('./components/AdminRoute'))

// ── Page loading fallback ─────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory">
      <Spinner size="lg" />
    </div>
  )
}

// ── Main layout (with Navbar + Footer) ────────────────────────────
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-ivory">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <ChatFAB />
    </div>
  )
}

// ── Auth layout (no footer) ───────────────────────────────────────
function AuthLayout() {
  return (
    <div className="min-h-screen bg-ivory">
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with full layout */}
          <Route element={<MainLayout />}>
            <Route path="/"                  element={<Home />} />
            <Route path="/portfolio"         element={<Portfolio />} />
            <Route path="/how-it-works"      element={<HowItWorks />} />
            <Route path="/services"          element={<Services />} />
            <Route path="/fabric-catalogue"  element={<FabricCatalogue />} />
            <Route path="/contact"           element={<Contact />} />
            <Route path="/faq"               element={<FAQ />} />

            {/* Protected customer routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard"              element={<CustomerDashboard />} />
              <Route path="/dashboard/orders"       element={<MyOrders />} />
              <Route path="/dashboard/orders/:id"   element={<OrderDetail />} />
              <Route path="/dashboard/profile"      element={<Profile />} />
              <Route path="/dashboard/wishlist"     element={<Wishlist />} />
              <Route path="/dashboard/messages"     element={<Messages />} />
              <Route path="/order"                  element={<OrderForm />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin"                       element={<AdminDashboard />} />
              <Route path="/admin/orders"                element={<AdminOrders />} />
              <Route path="/admin/orders/:id"            element={<AdminOrderDetail />} />
              <Route path="/admin/portfolio"             element={<AdminPortfolio />} />
              <Route path="/admin/fabrics"               element={<AdminFabrics />} />
              <Route path="/admin/customers"             element={<AdminCustomers />} />
              <Route path="/admin/reviews"               element={<AdminReviews />} />
              <Route path="/admin/promo-codes"           element={<AdminPromoCodes />} />
              <Route path="/admin/messages"              element={<AdminMessages />} />
            </Route>
          </Route>

          {/* Auth routes (no navbar/footer) */}
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
