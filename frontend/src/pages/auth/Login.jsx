// Login.jsx — Split layout login page with email/password + Google Sign-In
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Divider from '../../components/ui/Divider'
import useAuthStore from '../../store/authStore'
import { authService } from '../../services/auth'
import { signInWithGoogle } from '../../services/firebase'

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuthStore()
  const from      = location.state?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authService.login(data)
      login(res.user, res.access_token, res.refresh_token)
      toast.success(`Welcome back, ${res.user.full_name.split(' ')[0]}!`)
      navigate(res.user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try {
      const idToken = await signInWithGoogle()
      const res     = await authService.google(idToken)
      login(res.user, res.access_token, res.refresh_token)
      toast.success(`Welcome, ${res.user.full_name.split(' ')[0]}!`)
      navigate(res.user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Login — Tailoryy</title>
      </Helmet>
      <div className="min-h-screen flex">
        {/* Left — editorial image / quote */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-espresso overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop')" }}
          />
          <div className="relative z-10 flex flex-col justify-end p-14">
            <p className="font-serif text-4xl italic text-ivory leading-tight mb-4">
              "Where fabric<br />meets<br />craftsmanship."
            </p>
            <p className="font-sans text-sm text-ivory/50">Tailoryy — Your dream outfit, stitched to perfection.</p>
          </div>
          {/* Logo */}
          <Link to="/" className="absolute top-8 left-10 z-10">
            <span className="font-sans text-2xl font-medium text-ivory">tailor</span>
            <span className="font-serif text-2xl font-semibold text-terracotta italic">yy</span>
          </Link>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-ivory">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[400px]"
          >
            {/* Mobile logo */}
            <Link to="/" className="flex lg:hidden mb-8">
              <span className="font-sans text-2xl font-medium text-espresso">tailor</span>
              <span className="font-serif text-2xl font-semibold text-terracotta italic">yy</span>
            </Link>

            <h1 className="font-serif text-3xl text-espresso mb-1">Welcome back</h1>
            <p className="font-sans text-sm text-muted mb-8">Log in to track your orders and continue your style journey.</p>

            {/* Google button */}
            <Button
              variant="outline"
              onClick={handleGoogle}
              loading={gLoading}
              className="w-full mb-4 gap-3"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <Divider label="or" className="my-5" />

            {/* Email/password form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                required
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                })}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  error={errors.password?.message}
                  className="pr-10"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-9 text-muted hover:text-charcoal transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs text-terracotta hover:underline font-sans">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" loading={loading} className="w-full mt-2 gap-2">
                Log In <ArrowRight size={15} />
              </Button>
            </form>

            <p className="font-sans text-sm text-center text-muted mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-terracotta font-medium hover:underline">
                Sign up free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
