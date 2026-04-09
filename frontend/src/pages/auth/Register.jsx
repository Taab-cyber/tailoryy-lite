// Register.jsx — Split layout registration page
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const FIREBASE_ENABLED = import.meta.env.VITE_FIREBASE_API_KEY?.startsWith('AIza')

export default function Register() {
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [gLoading, setGLoading]   = useState(false)
  const navigate  = useNavigate()
  const { login } = useAuthStore()

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authService.register({
        full_name: data.full_name,
        email:     data.email,
        phone:     data.phone,
        password:  data.password,
      })
      login(res.user, res.access_token, res.refresh_token)
      toast.success('Account created! Welcome to Tailoryy.')
      navigate('/dashboard', { replace: true })
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
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setGLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Create Account — Tailoryy</title>
      </Helmet>
      <div className="min-h-screen flex">
        {/* Left — editorial */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-espresso overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop')" }}
          />
          <div className="relative z-10 flex flex-col justify-end p-14">
            <p className="font-serif text-4xl italic text-ivory leading-tight mb-4">
              "Every stitch<br />tells your<br />story."
            </p>
            <p className="font-sans text-sm text-ivory/50">Join thousands who've found their perfect fit.</p>
          </div>
          <Link to="/" className="absolute top-8 left-10 z-10">
            <span className="font-sans text-2xl font-medium text-ivory">tailor</span>
            <span className="font-serif text-2xl font-semibold text-terracotta italic">yy</span>
          </Link>
        </div>

        {/* Right — form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-ivory overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[400px]"
          >
            <Link to="/" className="flex lg:hidden mb-8">
              <span className="font-sans text-2xl font-medium text-espresso">tailor</span>
              <span className="font-serif text-2xl font-semibold text-terracotta italic">yy</span>
            </Link>

            <h1 className="font-serif text-3xl text-espresso mb-1">Create your account</h1>
            <p className="font-sans text-sm text-muted mb-8">Start your custom fashion journey today.</p>

            {FIREBASE_ENABLED && (
              <>
                <Button variant="outline" onClick={handleGoogle} loading={gLoading} className="w-full mb-4 gap-3">
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <Divider label="or" className="my-5" />
              </>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <Input
                label="Full name"
                type="text"
                placeholder="Priya Sharma"
                required
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
              />
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
              <Input
                label="Phone number"
                type="tel"
                placeholder="+91-98765 43210"
                error={errors.phone?.message}
                {...register('phone', {
                  pattern: { value: /^[+\d\s-]{8,15}$/, message: 'Enter a valid phone number' },
                })}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  required
                  error={errors.password?.message}
                  className="pr-10"
                  {...register('password', {
                    required:  'Password is required',
                    minLength: { value: 8, message: 'Min. 8 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-9 text-muted hover:text-charcoal transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                label="Confirm password"
                type={showPass ? 'text' : 'password'}
                placeholder="Re-enter password"
                required
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: v => v === password || 'Passwords do not match',
                })}
              />

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-terracotta"
                  {...register('terms', { required: 'You must accept the terms' })}
                />
                <span className="text-xs font-sans text-muted leading-relaxed">
                  I agree to Tailoryy's{' '}
                  <Link to="/terms" className="text-terracotta hover:underline">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-terracotta hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-error">{errors.terms.message}</p>
              )}

              <Button type="submit" loading={loading} className="w-full mt-2 gap-2">
                Create Account <ArrowRight size={15} />
              </Button>
            </form>

            <p className="font-sans text-sm text-center text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-terracotta font-medium hover:underline">Log in</Link>
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
